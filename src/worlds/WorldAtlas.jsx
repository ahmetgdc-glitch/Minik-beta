import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, Volume2, Star } from "lucide-react";
import { worlds, worldById } from "../data/content.js";
import { Art, MinoAvatar, assetUrl } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { playSound, unlockAudio } from "../audio/sounds.js";
import { atlasPages, sceneChapters } from "./scenes.js";
import { useScenePager } from "./useScenePager.js";

export default function WorldAtlas({ progress, onOpen, onStart, availableWorlds = worlds, welcome = false, resume = null }) {
  const { lang, reducedMotion } = progress.settings;
  const t = (de, tr) => lang === "tr" ? tr : de;
  const pages = useMemo(() => atlasPages(availableWorlds), [availableWorlds]);
  const offset = welcome ? 1 : 0;
  const pager = useScenePager(pages.length + offset, reducedMotion);
  const active = pages[pager.index - offset];
  function open(world) {
    unlockAudio();
    onOpen(world);
  }
  const greeting = progress.activeProfile?.name && !/^Kind \d+$/.test(progress.activeProfile.name)
    ? t(`Hallo ${progress.activeProfile.name}!`, `Merhaba ${progress.activeProfile.name}!`)
    : t("Hallo, ich bin Mino!", "Merhaba, ben Mino!");
  const portal = (world, position, currentPage) => (
    <button
      key={world.id}
      className={`atlas-place place-${position}`}
      aria-label={t(`${world.labels.de} entdecken`, `${world.labels.tr} dünyasını keşfet`)}
      tabIndex={currentPage ? 0 : -1}
      onClick={() => open(world)}
    >
      <Art name={world.asset} />
      <span className="place-name">{world.labels[lang]} <Play size={17} fill="currentColor" /></span>
      {(progress.worlds?.[`${lang}:${world.id}`]?.correct || 0) > 0 && <Star className="place-star" size={30} fill="currentColor" />}
    </button>
  );
  return (
    <section className="world-atlas" aria-label={t("Minos Entdeckerwelt", "Mino’nun keşif dünyası")}>
      <img className="atlas-landscape" src={assetUrl("assets/scenes/archipelago.webp")} alt="" fetchPriority="high" draggable="false" />
      <div className="atlas-heading">
        <h1>{welcome && pager.index === 0 ? greeting : active?.chapter[lang] || t("Deine Welten", "Dünyaların")}</h1>
        <button className="scene-round-button atlas-voice" onClick={() => {
          unlockAudio();
          speak(welcome && pager.index === 0 ? t("Hallo! Komm, wir entdecken die Welt!", "Merhaba! Haydi dünyayı keşfedelim!") : t("Wohin möchtest du? Tippe auf ein Bild.", "Nereye gidelim? Bir resme dokun."), lang, progress.settings);
        }} aria-label={t("Mino zuhören", "Mino’yu dinle")}><Volume2 size={25} /></button>
      </div>
      <div className="atlas-scroll" ref={pager.scrollRef} onScroll={pager.onScroll} onKeyDown={pager.onKeyDown}>
        {welcome && <div className="atlas-page atlas-welcome" aria-hidden={pager.index !== 0}>
          <button className="atlas-mino" tabIndex={pager.index === 0 ? 0 : -1} onClick={() => {
            playSound("tap", progress.settings);
            speak(t("Schön, dass du da bist!", "İyi ki geldin!"), lang, progress.settings);
          }} aria-label={t("Mino begrüßen", "Mino’ya merhaba de")}>
            <MinoAvatar outfit={progress.minoOutfit} />
            <span className="mino-greeting">{t("Komm mit!", "Haydi gel!")}</span>
          </button>
          {portal(worldById.animals, "welcome-one", pager.index === 0)}
          {portal(worldById.colors, "welcome-two", pager.index === 0)}
          <button className="atlas-start" tabIndex={pager.index === 0 ? 0 : -1} onClick={onStart} aria-label={resume ? t("Unterbrochenes Spiel fortsetzen", "Yarım kalan oyuna devam et") : t("Mit Mino spielen", "Mino ile oyna")}>
            <Play size={27} fill="currentColor" /><span>{resume ? t("Weiter!", "Devam!") : t("Spielen!", "Oyna!")}</span>
          </button>
        </div>}
        {pages.map((page, pageIndex) => <div className={`atlas-page chapter-${page.chapter.id}`} key={`${page.chapter.id}-${page.ids[0]}`} aria-hidden={pager.index !== pageIndex + offset}>
          {page.ids.map((id, index) => portal(worldById[id], page.ids.length === 1 ? "solo" : index + 1, pager.index === pageIndex + offset))}
          <MinoAvatar className="atlas-traveler" outfit={progress.minoOutfit} aria-hidden="true" />
        </div>)}
      </div>
      <div className="atlas-controls">
        <button className="scene-round-button" onClick={() => pager.go(pager.index - 1)} disabled={pager.index === 0} aria-label={t("Vorherige Insel", "Önceki ada")}><ChevronLeft size={30} /></button>
        <nav className="atlas-chapters" aria-label={t("Inseln", "Adalar")}>
          {sceneChapters.filter(chapter => pages.some(page => page.chapter.id === chapter.id)).map(chapter => <button
            key={chapter.id}
            className={active?.chapter.id === chapter.id ? "active" : ""}
            aria-label={chapter[lang]}
            aria-current={active?.chapter.id === chapter.id ? "true" : undefined}
            onClick={() => pager.go(pages.findIndex(page => page.chapter.id === chapter.id) + offset)}
          ><Art name={chapter.asset} /></button>)}
        </nav>
        <button className="scene-round-button" onClick={() => pager.go(pager.index + 1)} disabled={pager.index === pages.length + offset - 1} aria-label={t("Nächste Insel", "Sonraki ada")}><ChevronRight size={30} /></button>
      </div>
    </section>
  );
}
