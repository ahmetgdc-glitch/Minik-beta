import React, { useMemo, useState } from "react";
import { Play, ArrowLeft, Sparkles } from "lucide-react";
import { gameCatalog } from "../games/registry.js";
import { worlds } from "../data/content.js";
import { Art } from "../components/Visual.jsx";
import { unlockAudio } from "../audio/sounds.js";
import { gamesForAge } from "../learning/age.js";
import { recommendedActivities } from "../learning/recommendations.js";

function worldLabel(world, lang) {
  return world?.labels?.[lang] || world?.[lang] || world?.id || "";
}

export default function GamesScreen({ progress, onNavigate }) {
  const lang = progress.settings.lang,
    [selected, setSelected] = useState(null),
    [showAll, setShowAll] = useState(false),
    visibleGames = gamesForAge(gameCatalog, progress.activeProfile?.ageGroup),
    recommendation = useMemo(() => recommendedActivities(progress, lang, 1)[0] || null, [progress, lang]),
    featured = recommendation?.game && visibleGames.some((game) => game.id === recommendation.game.id)
      ? recommendation.game
      : visibleGames[0] || null,
    rest = visibleGames.filter((game) => game.id !== featured?.id),
    previewGames = showAll ? rest : rest.slice(0, 4),
    hiddenGameCount = Math.max(0, rest.length - previewGames.length);

  const selectedWorlds = useMemo(
    () => selected
      ? worlds.filter((world) => selected.allWorlds || selected.worlds.includes(world.id))
      : [],
    [selected],
  );

  function choose(game) {
    if (!game) return;
    if (game.worlds?.length === 1) {
      unlockAudio();
      onNavigate(`/play/${game.id}/${game.worlds[0]}`);
    } else setSelected(game);
  }

  function startFeatured() {
    if (!featured) return;
    const world = recommendation?.game?.id === featured.id ? recommendation.world : null;
    if (!world) {
      choose(featured);
      return;
    }
    unlockAudio();
    onNavigate(`/play/${featured.id}/${world.id}`);
  }

  function openWorld(world) {
    unlockAudio();
    onNavigate(`/play/${selected.id}/${world.id}`);
  }

  if (selected) {
    return (
      <main className="activity-playground world-playground" data-testid="world-playground">
        <section className="world-playground-header">
          <button className="back-link" onClick={() => setSelected(null)}>
            <ArrowLeft size={20} />
            {lang === "tr" ? "Geri" : "Zurück"}
          </button>
          <div className="world-playground-copy">
            <span className="playground-kicker">
              <Sparkles size={17} /> {selected[lang]}
            </span>
            <h1>{lang === "tr" ? "Nereye gidiyoruz?" : "Wohin geht’s?"}</h1>
            <p>
              {lang === "tr"
                ? "Bir dünyaya dokun ve oyuna atla."
                : "Tippe auf eine Welt und spring direkt ins Spiel."}
            </p>
          </div>
          <Art name={selected.asset} />
        </section>

        <section className="world-islands" aria-label={lang === "tr" ? "Oyun dünyaları" : "Spielwelten"}>
          {selectedWorlds.map((world) => {
            const completed = progress?.worlds?.[`${lang}:${world.id}`]?.correct || 0;
            return (
              <button
                key={world.id}
                className="world-island"
                style={{ "--world-color": world.color }}
                onClick={() => openWorld(world)}
                aria-label={`${worldLabel(world, lang)} · ${selected[lang]}`}
              >
                <div className="world-island-art">
                  <Art name={world.asset} />
                </div>
                <div className="world-island-copy">
                  <h2>{worldLabel(world, lang)}</h2>
                  <span>
                    {completed > 0
                      ? lang === "tr"
                        ? `${completed} doğru keşif`
                        : `${completed} richtige Entdeckungen`
                      : lang === "tr"
                        ? `${world.items.length} keşif`
                        : `${world.items.length} Entdeckungen`}
                  </span>
                </div>
                <span className="world-island-play" aria-hidden="true">
                  <Play size={23} fill="currentColor" />
                </span>
              </button>
            );
          })}
        </section>
      </main>
    );
  }

  return (
    <main className="activity-playground" data-testid="activity-playground">
      <section className="playground-hero">
        <div className="playground-copy">
          <span className="playground-kicker">
            <Sparkles size={17} />
            {lang === "tr" ? "Mino’nun oyun dünyası" : "Minos Spielwelt"}
          </span>
          <h1>{lang === "tr" ? "Hadi oynayalım!" : "Komm, wir spielen!"}</h1>
          <p>
            {lang === "tr"
              ? "Bir oyuna dokun. Mino seni yeni bir keşfe götürsün."
              : "Tippe auf ein Spiel. Mino nimmt dich mit auf eine neue Entdeckung."}
          </p>
        </div>
        <div className="playground-hero-art" aria-hidden="true">
          <Art name="puzzle-piece" />
        </div>
      </section>

      {featured && (
        <button
          className="playground-feature"
          style={{ "--game-color": featured.color }}
          onClick={startFeatured}
          aria-label={`${featured[lang]} · ${recommendation?.world ? worldLabel(recommendation.world, lang) : featured.description[lang]}`}
        >
          <div className="playground-feature-art">
            <Art name={featured.asset} />
          </div>
          <div className="playground-feature-copy">
            <small>{lang === "tr" ? "Mino bugün bunu seçti" : "Minos Tipp für heute"}</small>
            <h2>{featured[lang]}</h2>
            <p>
              {recommendation?.world && recommendation?.game?.id === featured.id
                ? `${worldLabel(recommendation.world, lang)} · ${featured.description[lang]}`
                : featured.description[lang]}
            </p>
            <span className="playground-play" aria-hidden="true">
              <Play size={30} fill="currentColor" />
            </span>
          </div>
        </button>
      )}

      {rest.length > 0 && (
        <>
          <div className="playground-path-title">
            <h2>{lang === "tr" ? "Bir oyun seç" : "Such dir ein Spiel aus"}</h2>
            <span>
              {showAll
                ? `${visibleGames.length} ${lang === "tr" ? "oyun" : "Spiele"}`
                : lang === "tr"
                  ? "Önce birkaç favori"
                  : "Erst ein paar Favoriten"}
            </span>
          </div>
          <section className="playground-river" aria-label={lang === "tr" ? "Oyun seçimi" : "Spielauswahl"}>
            {previewGames.map((game) => (
              <button
                className="playground-island"
                key={game.id}
                style={{ "--game-color": game.color }}
                onClick={() => choose(game)}
                aria-label={`${game[lang]} · ${game.description[lang]}`}
              >
                <span className="island-play" aria-hidden="true">
                  <Play size={20} fill="currentColor" />
                </span>
                <div className="playground-island-art">
                  <Art name={game.asset} />
                </div>
                <h3>{game[lang]}</h3>
              </button>
            ))}
          </section>
          {rest.length > 4 && (
            <button
              type="button"
              className="back-link"
              aria-expanded={showAll}
              onClick={() => setShowAll((value) => !value)}
            >
              <Sparkles size={20} />
              {showAll
                ? lang === "tr" ? "Daha az oyun göster" : "Weniger Spiele zeigen"
                : lang === "tr" ? `${hiddenGameCount} oyun daha` : `Noch ${hiddenGameCount} Spiele`}
            </button>
          )}
        </>
      )}
    </main>
  );
}
