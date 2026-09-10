import React, { useState } from "react";
import { worlds } from "../data/content.js";
import { sample, shuffle } from "../utils/random.js";
import Visual, { Art } from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { useLesson } from "./shared.jsx";
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
  return (
    <>
      <div className="sort-object">
        <Visual item={target} lang={lang} photos={settings.photos} />
        <b>{target.labels[lang]}</b>
      </div>
      <div className="sort-baskets">
        {groups.map((g) => (
          <button
            key={g.id}
            className={`sort-basket ${hint >= 2 && g.id === group.id ? "hint-target" : ""}`}
            style={{ "--basket": g.color }}
            onClick={() =>
              g.id === group.id ? onSolve([target.id]) : onWrong([target.id])
            }
          >
            <div className="basket-example">
              <Art name={g.asset} />
              <Art name={g.items[1].asset} />
            </div>
            <b>{g.labels[lang]}</b>
          </button>
        ))}
      </div>
    </>
  );
}
