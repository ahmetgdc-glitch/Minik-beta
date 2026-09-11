import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eraser, RotateCcw, Trash2, Check, Palette, Image as ImageIcon, Sparkles } from "lucide-react";
import Visual, { assetUrl } from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { speak } from "../audio/voice.js";
import { isMeaningfulStroke, MIN_STROKE_DISTANCE, pushDrawingHistory } from "./drawing.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const COLORS = ["#203750", "#ef5b5b", "#ff9d42", "#ffd43b", "#4bb978", "#3b92c9", "#855fd1", "#ef7eb2"];
const SIZES = [8, 16, 28];

export default function DrawGame({ items = [], lang, hint, paused, interactionBlocked = () => false, onReady, onSolve, settings = {} }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const guideRef = useRef(null);
  const guideUrlRef = useRef("");
  const drawing = useRef(false);
  const last = useRef(null);
  const strokeDistance = useRef(0);
  const pendingSnapshot = useRef(null);
  const history = useRef([]);
  const [color, setColor] = useState(COLORS[1]);
  const [size, setSize] = useState(SIZES[1]);
  const [eraser, setEraser] = useState(false);
  const [strokes, setStrokes] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [smartColor, setSmartColor] = useState(false);
  const templates = useMemo(() => [null, ...items.filter((item) => item?.type === "illustration").slice(0, 5)], [items]);
  const [templateId, setTemplateId] = useState(null);
  const template = templates.find(x => x?.id === templateId) || null;
  const templateUrl = template ? assetUrl(`assets/illustrations/${template.asset}.svg`) : "";
  guideUrlRef.current = templateUrl;
  const blocked = () => paused || interactionBlocked();

  const text = lang === "tr" ? "Büyük tuvalde boya, çiz ve hayal et." : "Male, zeichne und erfinde etwas auf der großen Fläche.";
  const help = lang === "tr" ? "Bir boyama resmi seç. Taşırmadan boya seçeneği renkleri otomatik doğru seçer." : "Wähle eine Malvorlage. Mit Zauber-Ausmalen bleibst du im Motiv und die Farben werden automatisch richtig.";
  useLesson(onReady, text, () => speak(text, lang, settings), [template?.id || "creative.draw"], help);

  function buildGuide(url = guideUrlRef.current) {
    const c = canvasRef.current, w = wrapRef.current;
    if (!c || !w || !url) {
      guideRef.current = null;
      return;
    }
    const rect = w.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const guide = document.createElement("canvas");
    guide.width = Math.max(1, Math.round(rect.width));
    guide.height = Math.max(1, Math.round(rect.height));
    const g = guide.getContext("2d", { willReadFrequently: true });
    const paintCanvas = document.createElement("canvas");
    paintCanvas.width = guide.width;
    paintCanvas.height = guide.height;
    const paintCtx = paintCanvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      if (url !== guideUrlRef.current) return;
      const visibleGuide = w.querySelector(".draw-template.has-item");
      const guideRect = visibleGuide?.getBoundingClientRect();
      const boxW = Math.min(rect.width, guideRect?.width || rect.width * .70);
      const boxH = Math.min(rect.height, guideRect?.height || rect.height * .70);
      const boxX = guideRect ? guideRect.left - rect.left : (rect.width - boxW) / 2;
      const boxY = guideRect ? guideRect.top - rect.top : (rect.height - boxH) / 2;
      const scale = Math.min(boxW / Math.max(1, img.naturalWidth), boxH / Math.max(1, img.naturalHeight));
      const drawW = img.naturalWidth * scale;
      const drawH = img.naturalHeight * scale;
      const x = boxX + (boxW - drawW) / 2;
      const y = boxY + (boxH - drawH) / 2;
      g.clearRect(0, 0, guide.width, guide.height);
      g.drawImage(img, x, y, drawW, drawH);
      guideRef.current = {
        canvas: guide,
        ctx: g,
        width: rect.width,
        height: rect.height,
        paintCanvas,
        paintCtx,
      };
    };
    img.src = url;
  }

  function fitCanvas() {
    const c = canvasRef.current, w = wrapRef.current;
    if (!c || !w) return;
    const rect = w.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const old = c.width && c.height ? c.toDataURL() : null;
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    c.style.width = `${rect.width}px`;
    c.style.height = `${rect.height}px`;
    const ctx = c.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (old) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = old;
    }
    buildGuide();
  }
  useEffect(() => {
    fitCanvas();
    const ro = new ResizeObserver(fitCanvas);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    buildGuide(templateUrl);
  }, [templateUrl]);

  useEffect(() => {
    if (!paused && !interactionBlocked()) return;
    drawing.current = false;
    strokeDistance.current = 0;
    pendingSnapshot.current = null;
    last.current = null;
    setConfirmClear(false);
  }, [paused, interactionBlocked]);

  function point(e) {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }
  function snapshot() {
    const c = canvasRef.current;
    if (!c) return null;
    try { return c.toDataURL("image/webp", 0.82); } catch {
      try { return c.toDataURL(); } catch { return null; }
    }
  }
  function save(value = snapshot()) {
    history.current = pushDrawingHistory(history.current, value);
  }
  function resetCanvas() {
    const c = canvasRef.current, ctx = c?.getContext("2d");
    if (c && ctx) ctx.clearRect(0, 0, c.width, c.height);
    history.current = [];
    setStrokes(0);
    setConfirmClear(false);
  }
  function selectTemplate(item) {
    if (blocked()) return;
    const nextId = item?.id || null;
    if (nextId === templateId) return;
    resetCanvas();
    setTemplateId(nextId);
    setSmartColor(Boolean(item));
    setEraser(false);
  }
  function guidedColorAt(p) {
    if (!smartColor || !template) return color;
    const guide = guideRef.current;
    if (!guide?.ctx) return null;
    const x = Math.max(0, Math.min(guide.canvas.width - 1, Math.round(p.x)));
    const y = Math.max(0, Math.min(guide.canvas.height - 1, Math.round(p.y)));
    try {
      const px = guide.ctx.getImageData(x, y, 1, 1).data;
      if (px[3] < 28) return null;
      return `rgb(${px[0]} ${px[1]} ${px[2]})`;
    } catch {
      return color;
    }
  }
  function smartPaintSegment(ctx, a, p) {
    const guide = guideRef.current;
    const paintCtx = guide?.paintCtx;
    const paintCanvas = guide?.paintCanvas;
    if (!guide?.canvas || !paintCtx || !paintCanvas) return false;

    const midpoint = { x: (p.x + a.x) / 2, y: (p.y + a.y) / 2 };
    if (!guidedColorAt(a) && !guidedColorAt(midpoint) && !guidedColorAt(p)) return false;

    paintCtx.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
    paintCtx.globalCompositeOperation = "source-over";
    paintCtx.fillStyle = "#fff";
    paintCtx.strokeStyle = "#fff";
    paintCtx.lineWidth = size;
    paintCtx.lineCap = "round";
    paintCtx.lineJoin = "round";
    paintCtx.beginPath();
    if (Math.hypot(p.x - a.x, p.y - a.y) < .5) {
      paintCtx.arc(p.x, p.y, Math.max(2, size / 2), 0, Math.PI * 2);
      paintCtx.fill();
    } else {
      paintCtx.moveTo(a.x, a.y);
      paintCtx.lineTo(p.x, p.y);
      paintCtx.stroke();
    }

    // Instead of painting one sampled color across several illustration
    // regions, reveal the exact source-art pixels under the brush. A stroke
    // crossing an eye, outline and face therefore keeps every region clean.
    paintCtx.globalCompositeOperation = "source-in";
    paintCtx.drawImage(guide.canvas, 0, 0, guide.width, guide.height);
    paintCtx.globalCompositeOperation = "source-over";

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(paintCanvas, 0, 0, guide.width, guide.height);
    ctx.restore();
    return true;
  }
  function start(e) {
    if (blocked()) return;
    e.preventDefault();
    const p = point(e);
    if (smartColor && template && !eraser && !guidedColorAt(p)) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pendingSnapshot.current = snapshot();
    strokeDistance.current = 0;
    drawing.current = true;
    last.current = p;
    if (smartColor && template && !eraser) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx && smartPaintSegment(ctx, p, p)) strokeDistance.current = MIN_STROKE_DISTANCE;
    }
  }
  function move(e) {
    if (!drawing.current || blocked()) return;
    e.preventDefault();
    const c = canvasRef.current, ctx = c.getContext("2d"), p = point(e), a = last.current;
    const segment = Math.hypot(p.x - a.x, p.y - a.y);
    let painted = false;

    if (segment > 0 && eraser) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      painted = true;
    } else if (segment > 0 && smartColor && template) {
      painted = smartPaintSegment(ctx, a, p);
    } else if (segment > 0) {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      painted = true;
    }

    if (painted) strokeDistance.current += segment;
    last.current = p;
  }
  function end(e) {
    if (!drawing.current) return;
    if (blocked()) {
      drawing.current = false;
      strokeDistance.current = 0;
      pendingSnapshot.current = null;
      last.current = null;
      return;
    }
    const meaningful = isMeaningfulStroke(strokeDistance.current);
    if (meaningful) {
      save(pendingSnapshot.current);
      setStrokes(s => s + 1);
    } else {
      const src = pendingSnapshot.current;
      if (src) {
        const c = canvasRef.current, ctx = c?.getContext("2d"), r = c?.getBoundingClientRect();
        if (c && ctx && r) {
          ctx.clearRect(0, 0, c.width, c.height);
          const img = new Image();
          img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
          img.src = src;
        }
      }
    }
    try { if (e?.pointerId != null) e.currentTarget?.releasePointerCapture?.(e.pointerId); } catch {}
    drawing.current = false;
    strokeDistance.current = 0;
    pendingSnapshot.current = null;
    last.current = null;
  }
  function clearNow() {
    if (blocked()) return;
    save();
    const c = canvasRef.current, ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    setStrokes(0);
    setConfirmClear(false);
  }
  function clear() {
    if (blocked()) return;
    if (strokes > 0) {
      setConfirmClear(true);
      return;
    }
    clearNow();
  }
  function undo() {
    if (blocked()) return;
    const src = history.current.pop();
    if (!src) return;
    const c = canvasRef.current, ctx = c.getContext("2d"), r = c.getBoundingClientRect();
    ctx.clearRect(0, 0, c.width, c.height);
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, r.width, r.height);
    img.src = src;
    setStrokes(s => Math.max(0, s - 1));
  }

  const controlsDisabled = paused || interactionBlocked();
  const automaticColors = Boolean(template && smartColor);

  return <div className="draw-stage">
    <div className="draw-template-strip" aria-label={lang === "tr" ? "Boyama resimleri" : "Malvorlagen"}>
      {templates.map((item) => <button key={item?.id || "free"} disabled={controlsDisabled} className={(item?.id || null) === templateId ? "active" : ""} onClick={() => selectTemplate(item)}>
        {item ? <Visual item={item} lang={lang} photos={false}/> : <><Sparkles size={28}/><b>{lang === "tr" ? "Serbest" : "Frei"}</b></>}
      </button>)}
    </div>
    <div className="draw-toolbar" aria-label={lang === "tr" ? "Boyama araçları" : "Malwerkzeuge"}>
      <button
        type="button"
        className={`smart-color-toggle ${automaticColors ? "active" : ""}`}
        disabled={controlsDisabled || !template}
        aria-pressed={automaticColors}
        onClick={() => { if (!blocked() && template) { setSmartColor((value) => !value); setEraser(false); } }}
      >
        <Sparkles size={21}/>
        <span><b>{lang === "tr" ? "Taşırmadan boya" : "Zauber-Ausmalen"}</b><small>{lang === "tr" ? "Renkler otomatik" : "Farben automatisch"}</small></span>
      </button>
      <span className="draw-tool-label"><Palette size={20}/>{automaticColors ? (lang === "tr" ? "Otomatik renk" : "Auto-Farbe") : (lang === "tr" ? "Renk" : "Farbe")}</span>
      <div className={`draw-colors ${automaticColors ? "automatic" : ""}`}>{COLORS.map(c => <button key={c} disabled={controlsDisabled || automaticColors} aria-label={c} className={color === c && !eraser ? "active" : ""} style={{"--c": c}} onClick={() => { if (!blocked()) { setColor(c); setEraser(false); } }} />)}</div>
      <div className="draw-sizes">{SIZES.map(s => <button key={s} disabled={controlsDisabled} className={size === s ? "active" : ""} onClick={() => { if (!blocked()) setSize(s); }}><i style={{width: s, height: s}}/></button>)}</div>
      <button disabled={controlsDisabled} className={eraser ? "tool-button active" : "tool-button"} onClick={() => { if (!blocked()) setEraser(e => !e); }} aria-label={lang === "tr" ? "Silgi" : "Radierer"}><Eraser size={21}/></button>
      <button disabled={controlsDisabled} className="tool-button" onClick={undo} aria-label={lang === "tr" ? "Geri al" : "Rückgängig"}><RotateCcw size={21}/></button>
      <button disabled={controlsDisabled} className="tool-button" onClick={clear} aria-label={lang === "tr" ? "Sil" : "Löschen"}><Trash2 size={21}/></button>
    </div>
    <div className={`draw-canvas-wrap ${hint >= 2 ? "hint-frame" : ""} ${automaticColors ? "smart-coloring" : ""}`} ref={wrapRef}>
      <div className={`draw-template ${template ? "has-item" : "free"}`} aria-hidden="true">
        {template ? <img className="draw-guide-image" src={templateUrl} alt="" draggable="false"/> : <ImageIcon size={110}/>} 
      </div>
      <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}/>
      {automaticColors && <div className="smart-color-hint" aria-hidden="true"><Sparkles size={16}/>{lang === "tr" ? "Taşmaz · doğru renk" : "Bleibt im Motiv · richtige Farbe"}</div>}
    </div>
    <button className="primary draw-done" disabled={controlsDisabled || strokes < 3} onClick={() => { if (!blocked()) onSolve([template?.id || "creative.draw"]); }}><Check size={22}/>{lang === "tr" ? "Resmim hazır" : "Mein Bild ist fertig"}</button>
    <ConfirmDialog
      open={confirmClear && !controlsDisabled}
      title={lang === "tr" ? "Resmi silelim mi?" : "Bild löschen?"}
      message={lang === "tr" ? "Tuvaldeki çizimin tamamı silinecek." : "Deine ganze Zeichnung auf der Leinwand wird gelöscht."}
      confirmLabel={lang === "tr" ? "Sil" : "Löschen"}
      cancelLabel={lang === "tr" ? "İptal" : "Abbrechen"}
      danger
      onCancel={() => setConfirmClear(false)}
      onConfirm={clearNow}
    />
  </div>;
}