import React, { useState } from "react";
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
  const text =
    lang === "tr" ? "Hangi sepete ait?" : "In welchen Korb gehört das?";
  useLesson(
    onReady,
    text,
    () => speak(`${text} ${target.labels[lang]}.`, lang, settings),
    [target.id],
    group.labels[lang],
  );
  function place(source, destination) {
    if (paused || interactionBlocked() || source !== target.id) return;
    if (!groups.some(g => g.id === destination)) return;
    destination === group.id ? onSolve([target.id]) : onWrong([target.id]);
  }
  const placement = useDragPlacement({ paused, interactionBlocked, onDrop: place,
    onSelect: () => speak(target.labels[lang], lang, settings) });
  return (
    <div className="sort-playground" ref={placement.boardRef}>
      <button className={`sort-object ${placement.drag ? "is-dragging" : ""}`}
        {...placement.sourceProps(target.id)} disabled={paused}
        aria-label={`${target.labels[lang]}. ${lang === "tr" ? "Sepete sürükle veya sepete dokun." : "Zum Korb ziehen oder einen Korb antippen."}`}>
        <Visual item={target} lang={lang} photos={settings.photos} />
        <b>{target.labels[lang]}</b>
      </button>
      <div className="sort-baskets">
        {groups.map((g) => (
          <button
            key={g.id}
            data-drop-id={g.id}
            className={`sort-basket ${placement.drag?.over === g.id ? "drop-hover" : ""} ${hint >= 2 && g.id === group.id ? "hint-target" : ""}`}
            style={{ "--basket": g.color }}
            disabled={paused}
            aria-label={g.labels[lang]}
            onClick={() => place(target.id, g.id)}
          >
            <div className="basket-example">
              <Art name={g.asset} />
              <Art name={g.items[1].asset} />
            </div>
            <b>{g.labels[lang]}</b>
          </button>
        ))}
      </div>
      <DragPreview drag={placement.drag} items={[target]} {...{lang, settings}} />
    </div>
  );
}
