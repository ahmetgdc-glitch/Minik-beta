import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eraser, RotateCcw, Trash2, Check, Palette, Image as ImageIcon, Sparkles } from "lucide-react";
import Visual from "../components/Visual.jsx";
import { useLesson } from "./shared.jsx";
import { isMeaningfulStroke, pushDrawingHistory } from "./drawing.js";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const COLORS = ["#203750", "#ef5b5b", "#ff9d42", "#ffd43b", "#4bb978", "#3b92c9", "#855fd1", "#ef7eb2"];
const SIZES = [8, 16, 28];

export default function DrawGame({ items = [], lang, hint, paused, interactionBlocked = () => false, onReady, onSolve }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
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
  const templates = useMemo(() => [null, ...items.slice(0, 5)], [items]);
  const [templateId, setTemplateId] = useState(null);
  const template = templates.find(x => x?.id === templateId) || null;
  const blocked = () => paused || interactionBlocked();

  const text = lang === "tr" ? "Büyük tuvalde boya, çiz ve hayal et." : "Male, zeichne und erfinde etwas auf der großen Fläche.";
  useLesson(onReady, text, () => {}, [template?.id || "creative.draw"], lang === "tr" ? "Bir renk seç. İstersen bir boyama resmi seç." : "Wähle eine Farbe. Du kannst auch eine Malvorlage wählen.");

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
  }
  useEffect(() => {
    fitCanvas();
    const ro = new ResizeObserver(fitCanvas);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

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
  function start(e) {
    if (blocked()) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pendingSnapshot.current = snapshot();
    strokeDistance.current = 0;
    drawing.current = true;
    last.current = point(e);
  }
  function move(e) {
    if (!drawing.current || blocked()) return;
    e.preventDefault();
    const c = canvasRef.current, ctx = c.getContext("2d"), p = point(e), a = last.current;
    ctx.globalCompositeOperation = eraser ? "destination-out" : "source-over";
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    const segment = Math.hypot(p.x - a.x, p.y - a.y);
    strokeDistance.current += segment;
    if (segment > 0) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
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

  return <div className="draw-stage">
    <div className="draw-template-strip" aria-label={lang === "tr" ? "Boyama resimleri" : "Malvorlagen"}>
      {templates.map((item) => <button key={item?.id || "free"} disabled={controlsDisabled} className={(item?.id || null) === templateId ? "active" : ""} onClick={() => { if (!blocked()) setTemplateId(item?.id || null); }}>
        {item ? <Visual item={item} lang={lang} photos={false}/> : <><Sparkles size={28}/><b>{lang === "tr" ? "Serbest" : "Frei"}</b></>}
      </button>)}
    </div>
    <div className="draw-toolbar" aria-label={lang === "tr" ? "Boyama araçları" : "Malwerkzeuge"}>
      <span className="draw-tool-label"><Palette size={20}/>{lang === "tr" ? "Renk" : "Farbe"}</span>
      <div className="draw-colors">{COLORS.map(c => <button key={c} disabled={controlsDisabled} aria-label={c} className={color === c && !eraser ? "active" : ""} style={{"--c": c}} onClick={() => { if (!blocked()) { setColor(c); setEraser(false); } }} />)}</div>
      <div className="draw-sizes">{SIZES.map(s => <button key={s} disabled={controlsDisabled} className={size === s ? "active" : ""} onClick={() => { if (!blocked()) setSize(s); }}><i style={{width: s, height: s}}/></button>)}</div>
      <button disabled={controlsDisabled} className={eraser ? "tool-button active" : "tool-button"} onClick={() => { if (!blocked()) setEraser(e => !e); }} aria-label={lang === "tr" ? "Silgi" : "Radierer"}><Eraser size={21}/></button>
      <button disabled={controlsDisabled} className="tool-button" onClick={undo} aria-label={lang === "tr" ? "Geri al" : "Rückgängig"}><RotateCcw size={21}/></button>
      <button disabled={controlsDisabled} className="tool-button" onClick={clear} aria-label={lang === "tr" ? "Sil" : "Löschen"}><Trash2 size={21}/></button>
    </div>
    <div className={`draw-canvas-wrap ${hint >= 2 ? "hint-frame" : ""}`} ref={wrapRef}>
      <div className={`draw-template ${template ? "has-item" : "free"}`} aria-hidden="true">
        {template ? <Visual item={template} lang={lang} photos={false}/> : <ImageIcon size={110}/>} 
      </div>
      <canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}/>
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
