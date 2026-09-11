import React, { useState } from "react";
import { Move, Sparkles } from "lucide-react";
import { worlds } from "../data/content.js";
import { sample, shuffle } from "../utils/random.js";
import Visual, { Art } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
import { useDragPlacement } from "./useDragPlacement.js";
import DragPreview from "./DragPreview.jsx";

const contrasts = {
  animals: "vehicles",
  food: "clothes",
  vehicles: "animals",
  clothes: "food",
  home: "animals",
  nature: "vehicles",
  toys: "food",
};

export default function SortGame({
  world,
  lang,
  settings,
  hint,
  paused,
  interactionBlocked = () => false,
  onReady,
  onWrong,
  onSolve,
}) {
  const [groups] = useState(() =>
    shuffle([
      world,
      worlds.find((w) => w.id === contrasts[world.id]) || worlds[0],
    ]),
  );
  const [group] = useState(() => sample(groups, 1)[0]),
    [target] = useState(
      () =>
        sample(
          group.items.filter((x) => x.type === "illustration"),
          1,
        )[0],
    );
  const text = lang === "tr" ? "Hangi sepete ait?" : "In welchen Korb gehört das?";

  useLesson(
    onReady,
    text,
    () => speak(`${text} ${target.labels[lang]}.`, lang, settings),
    [target.id],
    group.labels[lang],
  );

  function place(source, destination) {
    if (paused || interactionBlocked() || source !== target.id) return;
    if (!groups.some((g) => g.id === destination)) return;
    destination === group.id ? onSolve([target.id]) : onWrong([target.id]);
  }

  const placement = useDragPlacement({
    paused,
    interactionBlocked,
    onDrop: place,
    onSelect: () => speak(target.labels[lang], lang, settings),
  });

  return (
    <section className="sort-playground sort-workshop" ref={placement.boardRef} aria-label={text}>
      <div className="sort-workshop-sky" aria-hidden="true">
        <span className="sort-workshop-cloud cloud-one" />
        <span className="sort-workshop-cloud cloud-two" />
      </div>

      <header className="sort-workshop-header">
        <span className="sort-workshop-badge" aria-hidden="true"><Sparkles size={25} /></span>
        <div>
          <strong>{lang === "tr" ? "Mino'nun ayırma atölyesi" : "Minos Sortierwerkstatt"}</strong>
          <span>{lang === "tr" ? "Resmi doğru yere götür" : "Bring das Bild an den richtigen Platz"}</span>
        </div>
      </header>

      <div className="sort-object-stage">
        <div className="sort-object-halo" aria-hidden="true" />
        <button
          className={`sort-object ${placement.drag ? "is-dragging" : ""}`}
          {...placement.sourceProps(target.id)}
          disabled={paused}
          aria-label={`${target.labels[lang]}. ${lang === "tr" ? "Sepete sürükle veya sepete dokun." : "Zum Korb ziehen oder einen Korb antippen."}`}
        >
          <Visual item={target} lang={lang} photos={settings.photos} />
          <b>{target.labels[lang]}</b>
        </button>
        <div className="sort-drag-tip" aria-hidden="true">
          <Move size={20} />
          <span>{lang === "tr" ? "Sürükle veya sepete dokun" : "Ziehen oder Korb antippen"}</span>
        </div>
      </div>

      <div className="sort-baskets" role="group" aria-label={lang === "tr" ? "Sepetler" : "Körbe"}>
        {groups.map((g, index) => {
          const active = placement.drag?.over === g.id;
          const hinted = hint >= 2 && g.id === group.id;
          return (
            <button
              key={g.id}
              data-drop-id={g.id}
              className={`sort-basket ${active ? "drop-hover" : ""} ${hinted ? "hint-target" : ""}`}
              style={{ "--basket": g.color }}
              disabled={paused}
              aria-label={g.labels[lang]}
              onClick={() => place(target.id, g.id)}
            >
              <span className="basket-number" aria-hidden="true">{index + 1}</span>
              <div className="basket-example" aria-hidden="true">
                <Art name={g.asset} />
                <Art name={g.items[1]?.asset || g.asset} />
              </div>
              <b>{g.labels[lang]}</b>
              <span className="basket-drop-label">
                {active
                  ? lang === "tr" ? "Buraya bırak!" : "Hier ablegen!"
                  : lang === "tr" ? "Buraya mı?" : "Hierhin?"}
              </span>
            </button>
          );
        })}
      </div>

      <DragPreview drag={placement.drag} items={[target]} {...{ lang, settings }} />
    </section>
  );
}
