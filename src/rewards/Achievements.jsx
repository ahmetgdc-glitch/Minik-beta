import React from "react";
import { Check, Lock, Medal, Sparkles } from "lucide-react";
import { Art } from "../components/Visual.jsx";
import { achievementState } from "./achievements.js";

export default function Achievements({ progress }) {
  const lang = progress.settings.lang;
  const items = achievementState(progress);
  const unlocked = items.filter((item) => item.unlocked).length;

  return (
    <section className="achievement-section" aria-labelledby="achievement-title">
      <div className="section-heading achievement-heading">
        <div>
          <span className="eyebrow">
            {lang === "tr" ? "Başarı yolun" : "Dein Erfolgsweg"}
          </span>
          <h2 id="achievement-title">
            {lang === "tr" ? "Mino’nun madalya yolu" : "Minos Medaillenweg"}
          </h2>
          <p>
            {lang === "tr"
              ? "Oynadıkça yol boyunca yeni duraklar parlıyor."
              : "Beim Spielen leuchten entlang des Weges immer neue Stationen auf."}
          </p>
        </div>
        <span className="achievement-count">
          <Medal size={20} /> {unlocked} / {items.length}
        </span>
      </div>

      <div className="achievement-trail" aria-label={lang === "tr" ? "Madalya yolu" : "Medaillenweg"}>
        {items.map((achievement) => (
          <article
            key={achievement.id}
            className={`achievement-stop ${achievement.unlocked ? "unlocked" : "locked"}`}
          >
            <div className="achievement-medal-art">
              <Art name={achievement.asset} />
              <span className="achievement-status-badge" aria-hidden="true">
                {achievement.unlocked ? <Check size={24} /> : <Lock size={21} />}
              </span>
            </div>
            <h3>{lang === "tr" ? achievement.tr : achievement.de}</h3>
            <p>{lang === "tr" ? achievement.textTr : achievement.textDe}</p>
          </article>
        ))}

        <div className="achievement-finish">
          <Sparkles size={24} aria-hidden="true" />
          <span>
            {unlocked === items.length
              ? lang === "tr"
                ? "Bütün madalyalar parlıyor!"
                : "Alle Medaillen leuchten!"
              : lang === "tr"
                ? "Bir sonraki parıltı seni bekliyor."
                : "Der nächste leuchtende Meilenstein wartet auf dich."}
          </span>
        </div>
      </div>
    </section>
  );
}
