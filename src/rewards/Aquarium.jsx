import React, { useState } from "react";
import { Check, Lock, Star, Gift } from "lucide-react";
import { rewards, claimableRewards, nextReward } from "./catalog.js";
import { dispatch } from "../progress/store.js";
import { MinoAvatar, Art } from "../components/Visual.jsx";
import { playSound } from "../audio/sounds.js";
import { speak } from "../audio/voice.js";
import Achievements from "./Achievements.jsx";
import { minoOutfits, nextOutfit } from "./outfits.js";
import { useModalSafety } from "../app/useModalSafety.js";
export default function Aquarium({ progress }) {
  const lang = progress.settings.lang,
    [revealed, setRevealed] = useState(null);
  useModalSafety(Boolean(revealed), () => setRevealed(null));
  const available = claimableRewards(progress),
    next = nextReward(progress),
    outfitNext = nextOutfit(progress);
  const equipped = (id) => progress.equipped.includes(id);
  function claim() {
    const reward = available[0];
    if (!reward) return;
    dispatch({ type: "claim", reward });
    setRevealed(reward);
    playSound("success", progress.settings);
    speak(
      lang === "tr"
        ? `Yeni hazinen: ${reward.tr}`
        : `Dein neuer Schatz: ${reward.de}`,
      lang,
      progress.settings,
    );
  }
  return (
    <>
      <div className="section-heading aquarium-heading">
        <div>
          <span className="eyebrow">
            {lang === "tr" ? "Senin küçük okyanusun" : "Dein kleiner Ozean"}
          </span>
          <h1>{lang === "tr" ? "Mino’nun akvaryumu" : "Minos Aquarium"}</h1>
        </div>
        <span className="star-pill">
          <Star fill="currentColor" />
          {progress.stars}
        </span>
      </div>
      <section className="aquarium-tank">
        <div className="ocean-light" />
        <div className="bubbles">
          {Array.from({ length: 8 }, (_, i) => (
            <i
              key={i}
              style={{ left: `${10 + i * 12}%`, animationDelay: `${i * 0.7}s` }}
            />
          ))}
        </div>
        <div className="aquarium-mino">
          <MinoAvatar outfit={progress.minoOutfit} />
          {equipped("crown") && <Art className="mino-crown" name="crown" />}
        </div>
        <div className="sea-bed" />
        {rewards
          .filter((r) => equipped(r.id) && r.id !== "crown")
          .map((r) => (
            <Art
              key={r.id}
              className={`aquarium-decoration decor-${r.id}`}
              name={r.asset}
            />
          ))}
      </section>
      <div className="treasure-panel">
        <Art name="wrapped-gift" />
        <div>
          <h2>
            {available.length
              ? lang === "tr"
                ? "Bir hazine seni bekliyor!"
                : "Ein Schatz wartet auf dich!"
              : lang === "tr"
                ? "Bir sonraki hazinen"
                : "Dein nächster Schatz"}
          </h2>
          <p>
            {next
              ? available.length
                ? next[lang]
                : lang === "tr"
                  ? `${Math.max(0, next.stars - progress.stars)} yıldız sonra: ${next.tr}`
                  : `Noch ${Math.max(0, next.stars - progress.stars)} Sterne bis: ${next.de}`
              : lang === "tr"
                ? "Bütün hazineler senin!"
                : "Alle Schätze gehören dir!"}
          </p>
          {next && (
            <div className="reward-progress">
              <i
                style={{
                  width: `${Math.min(100, (progress.stars / next.stars) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
        <button
          className="primary"
          disabled={!available.length}
          onClick={claim}
        >
          <Gift size={21} />
          {lang === "tr" ? "Aç" : "Öffnen"}
        </button>
      </div>
      <div className="section-heading">
        <h2>
          {lang === "tr" ? "Hazine koleksiyonun" : "Deine Schatzsammlung"}
        </h2>
        <span>
          {progress.inventory.length} / {rewards.length}
        </span>
      </div>
      <div className="rewards-grid">
        {rewards.map((r) => {
          const owned = progress.inventory.includes(r.id);
          return (
            <button
              className={`reward-card ${owned ? "owned" : ""} ${equipped(r.id) ? "equipped" : ""}`}
              key={r.id}
              disabled={!owned}
              onClick={() => dispatch({ type: "equip", id: r.id })}
            >
              <Art name={r.asset} />
              <h3>{r[lang]}</h3>
              <span>
                {owned ? (
                  equipped(r.id) ? (
                    <>
                      <Check size={16} />
                      {lang === "tr" ? "Akvaryumda" : "Im Aquarium"}
                    </>
                  ) : lang === "tr" ? (
                    "Yerleştir"
                  ) : (
                    "Platzieren"
                  )
                ) : (
                  <>
                    <Lock size={15} />
                    {r.stars}
                    <Star size={15} />
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <section className="outfit-section" aria-labelledby="outfit-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{lang === "tr" ? "Mino’yu giydir" : "Mino anziehen"}</span>
            <h2 id="outfit-title">{lang === "tr" ? "Mino kıyafetleri" : "Minos Outfits"}</h2>
            <p>{outfitNext ? (lang === "tr" ? `${outfitNext.stars - progress.stars} yıldız sonra yeni kıyafet` : `Noch ${outfitNext.stars - progress.stars} Sterne bis zum nächsten Outfit`) : (lang === "tr" ? "Bütün kıyafetler açıldı!" : "Alle Outfits sind freigeschaltet!")}</p>
          </div>
        </div>
        <div className="outfit-grid">
          {minoOutfits.map((o) => {
            const unlocked = progress.stars >= o.stars;
            const selected = progress.minoOutfit === o.id;
            return (
              <button
                key={o.id}
                className={`outfit-card ${unlocked ? "unlocked" : "locked"} ${selected ? "selected" : ""}`}
                disabled={!unlocked}
                onClick={() => dispatch({ type: "outfit", id: o.id, stars: o.stars })}
                aria-pressed={selected}
              >
                <MinoAvatar outfit={o.id} />
                <b>{o[lang]}</b>
                <span>{selected ? (lang === "tr" ? "Seçili" : "Ausgewählt") : unlocked ? (lang === "tr" ? "Giydir" : "Anziehen") : `${o.stars} ★`}</span>
              </button>
            );
          })}
        </div>
      </section>
      <Achievements progress={progress} />
      {revealed && (
        <div className="modal-scrim">
          <div
            className="reward-reveal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reward-title"
          >
            <span className="eyebrow">
              {lang === "tr" ? "Yeni hazinen" : "Dein neuer Schatz"}
            </span>
            <Art name={revealed.asset} />
            <h2 id="reward-title">{revealed[lang]}</h2>
            <button
              className="primary"
              autoFocus
              onClick={() => setRevealed(null)}
            >
              {lang === "tr" ? "Harika!" : "Juhu!"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
