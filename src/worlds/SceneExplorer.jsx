import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Volume2, Check } from "lucide-react";
import Visual, { MinoAvatar, assetUrl } from "../components/Visual.jsx";
import { sceneForWorld } from "./scenes.js";
import { useScenePager } from "./useScenePager.js";

export default function SceneExplorer({ items, worldId, lang, settings, found = [], onDiscover, onMino, outfit, hint = 0, paused = false, interactionBlocked = () => false, footer }) {
  const pager = useScenePager(items.length, settings.reducedMotion);
  const pointer = useRef(null);
  const t = (de, tr) => lang === "tr" ? tr : de;
  const controlsDisabled = paused || interactionBlocked();
  return <section className={`discovery-stage stage-${sceneForWorld(worldId)}`} aria-label={t("Entdecken und hören", "Keşfet ve dinle")} aria-disabled={controlsDisabled || undefined}>
    <img className="discovery-backdrop" src={assetUrl(`assets/scenes/${sceneForWorld(worldId)}.webp`)} alt="" draggable="false" />
    <div
      className="discovery-viewport"
      ref={pager.scrollRef}
      onScroll={pager.onScroll}
      onKeyDown={event => { if (!controlsDisabled) pager.onKeyDown(event); }}
    >
      {items.map((item, index) => <div className="discovery-slide" key={item.id} aria-hidden={index !== pager.index}>
        <button
          className={`discovery-object ${found.includes(item.id) ? "discovered" : ""} ${hint >= 2 && !found.includes(item.id) ? "hint-target" : ""}`}
          aria-label={item.labels[lang]}
          tabIndex={index === pager.index && !controlsDisabled ? 0 : -1}
          disabled={controlsDisabled}
          onPointerDown={event => {
            if (controlsDisabled) return;
            pointer.current = { x: event.clientX, y: event.clientY };
          }}
          onPointerCancel={() => { pointer.current = null; }}
          onClick={event => {
            const start = pointer.current;
            pointer.current = null;
            if (controlsDisabled) return;
            if (event.detail > 0 && start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 14) return;
            onDiscover(item);
          }}
        >
          <Visual item={item} lang={lang} photos={settings.photos} />
          <span className="discovery-word">{found.includes(item.id) ? <Check size={24} /> : <Volume2 size={24} />}{item.labels[lang]}</span>
        </button>
      </div>)}
    </div>
    <button className="scene-round-button discovery-prev" disabled={pager.index === 0 || controlsDisabled} onClick={() => pager.go(pager.index - 1)} aria-label={t("Vorheriges Bild", "Önceki resim")}><ChevronLeft size={29} /></button>
    <button className="scene-round-button discovery-next" disabled={pager.index === items.length - 1 || controlsDisabled} onClick={() => pager.go(pager.index + 1)} aria-label={t("Nächstes Bild", "Sonraki resim")}><ChevronRight size={29} /></button>
    <div className="discovery-footer">
      <button className="scene-mino" onClick={onMino} disabled={controlsDisabled} aria-label={t("Mino zuhören", "Mino’yu dinle")}><MinoAvatar outfit={outfit} /></button>
      <span className="discovery-position" aria-live="polite">{pager.index + 1} / {items.length}</span>
      {footer}
    </div>
  </section>;
}
