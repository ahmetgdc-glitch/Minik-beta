import React, { useState } from "react";
import { Play, ArrowLeft } from "lucide-react";
import { gameCatalog } from "../games/registry.js";
import { worlds } from "../data/content.js";
import { Art } from "../components/Visual.jsx";
import WorldCard from "../components/WorldCard.jsx";
import { unlockAudio } from "../audio/sounds.js";
import { gamesForAge } from "../learning/age.js";
export default function GamesScreen({ progress, onNavigate }) {
  const lang = progress.settings.lang,
    [selected, setSelected] = useState(null),
    visibleGames = gamesForAge(gameCatalog, progress.activeProfile?.ageGroup);
  function choose(game) {
    if (game.worlds?.length === 1) {
      unlockAudio();
      onNavigate(`/play/${game.id}/${game.worlds[0]}`);
    } else setSelected(game);
  }
  if (selected)
    return (
      <>
        <button className="back-link" onClick={() => setSelected(null)}>
          <ArrowLeft size={18} />
          {lang === "tr" ? "Tüm oyunlar" : "Alle Spiele"}
        </button>
        <div className="section-heading">
          <div>
            <span className="eyebrow">{selected[lang]}</span>
            <h1>{lang === "tr" ? "Hangi dünyada?" : "In welcher Lernwelt?"}</h1>
          </div>
        </div>
        <div className="world-grid">
          {worlds
            .filter((w) => selected.allWorlds || selected.worlds.includes(w.id))
            .map((w) => (
              <WorldCard
                key={w.id}
                world={w}
                {...{ lang, progress }}
                onOpen={() => {
                  unlockAudio();
                  onNavigate(`/play/${selected.id}/${w.id}`);
                }}
              />
            ))}
        </div>
      </>
    );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {lang === "tr"
              ? "Bir oyun, yeni bir keşif"
              : "Ein Spiel, eine neue Entdeckung"}
          </span>
          <h1>{lang === "tr" ? "Oyun sandığın" : "Deine Spielkiste"}</h1>
          <p>
            {lang === "tr"
              ? "Bugün ne oynamak istersin?"
              : "Worauf hast du heute Lust?"}
          </p>
        </div>
        <Art className="heading-art" name="puzzle-piece" />
      </div>
      <div className="games-grid">
        {visibleGames.map((g, i) => (
          <button
            className="game-card"
            key={g.id}
            style={{ "--game-color": g.color }}
            onClick={() => choose(g)}
          >
            <div className="game-card-art">
              <Art name={g.asset} />
              <span>
                <Play size={20} fill="currentColor" />
              </span>
            </div>
            <h3>{g[lang]}</h3>
            <p>{g.description[lang]}</p>
          </button>
        ))}
      </div>
    </>
  );
}
