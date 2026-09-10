import React, { useState, useRef } from "react";
import { useLesson } from "./shared.jsx";
import { speak } from "../audio/voice.js";
// Ordered motor paths: success needs progression along the actual numeral, not arbitrary scribbling.
export const tracePaths = {
  1: [
    [125, 90],
    [200, 35],
    [200, 300],
  ],
  2: [
    [85, 95],
    [95, 55],
    [150, 30],
    [220, 45],
    [255, 85],
    [245, 130],
    [200, 180],
    [100, 290],
    [260, 290],
  ],
  3: [
    [90, 55],
    [160, 30],
    [225, 45],
    [250, 95],
    [210, 145],
    [160, 160],
    [220, 175],
    [255, 220],
    [230, 280],
    [160, 305],
    [85, 275],
  ],
  4: [
    [230, 305],
    [230, 40],
    [75, 225],
    [280, 225],
  ],
  5: [
    [260, 40],
    [100, 40],
    [90, 155],
    [180, 145],
    [245, 180],
    [255, 230],
    [225, 280],
    [150, 305],
    [90, 280],
  ],
};
export const letterTracePaths = {
  C: [[260, 75], [220, 45], [150, 35], [95, 65], [70, 120], [65, 200], [90, 265], [145, 300], [215, 290], [260, 255]],
  I: [[95, 45], [245, 45], [170, 45], [170, 300], [95, 300], [245, 300]],
  L: [[110, 45], [110, 285], [255, 285]],
  O: [[170, 35], [105, 50], [70, 105], [60, 180], [80, 250], [130, 295], [200, 300], [255, 265], [280, 200], [275, 120], [235, 60], [170, 35]],
  U: [[80, 45], [80, 200], [95, 260], [140, 295], [200, 295], [245, 260], [260, 200], [260, 45]],
};
function densify(points) {
  return points.flatMap((p, i) => {
    if (!i) return [p];
    const prev = points[i - 1],
      n = Math.ceil(Math.hypot(p[0] - prev[0], p[1] - prev[1]) / 14);
    return Array.from({ length: n }, (_, j) => [
      prev[0] + ((p[0] - prev[0]) * (j + 1)) / n,
      prev[1] + ((p[1] - prev[1]) * (j + 1)) / n,
    ]);
  });
}
export default function TraceGame({
  world,
  round,
  lang,
  settings,
  hint,
  onReady,
  onSolve,
}) {
  const isLetter = world?.id === "letters";
  const [target] = useState(() => {
    if (isLetter) {
      const letters = Object.keys(letterTracePaths);
      return letters[Math.floor(Math.random() * letters.length)];
    }
    return 1 + Math.floor(Math.random() * 5);
  });
  const sourcePath = isLetter ? letterTracePaths[target] : tracePaths[target];
  const points = densify(sourcePath),
    [index, setIndex] = useState(0),
    [stroke, setStroke] = useState([]),
    down = useRef(false),
    last = useRef(0);
  const text = isLetter
    ? lang === "tr"
      ? `${target} harfini çiz. Yeşil noktadan başla.`
      : `Fahre den Buchstaben ${target} nach. Starte am grünen Punkt.`
    : lang === "tr"
      ? `${target} sayısını çiz. Yeşil noktadan başla.`
      : `Fahre die ${target} nach. Starte am grünen Punkt.`;
  const itemId = isLetter ? `letters.${String(target).toLowerCase()}` : `numbers.${target}`;
  useLesson(
    onReady,
    text,
    () => speak(text, lang, settings),
    [itemId],
    lang === "tr" ? "Yeşil noktayı takip et." : "Folge dem grünen Punkt.",
  );
  function follow(e) {
    if (!down.current) return;
    const rect = e.currentTarget.getBoundingClientRect(),
      x = ((e.clientX - rect.left) * 340) / rect.width,
      y = ((e.clientY - rect.top) * 340) / rect.height;
    let next = last.current;
    while (
      next < points.length &&
      Math.hypot(x - points[next][0], y - points[next][1]) < 32
    )
      next++;
    if (next !== last.current) {
      last.current = next;
      setIndex(next);
      setStroke(points.slice(0, next));
      if (next >= points.length) {
        down.current = false;
        onSolve([itemId]);
      }
    }
  }
  return (
    <div className="trace-wrap">
      <svg
        className="trace-board"
        viewBox="0 0 340 340"
        role="img"
        aria-label={text}
        onPointerDown={(e) => {
          down.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          follow(e);
        }}
        onPointerMove={follow}
        onPointerUp={() => (down.current = false)}
        onPointerCancel={() => (down.current = false)}
      >
        <polyline
          points={sourcePath.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#d9e7ed"
          strokeWidth="48"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={sourcePath.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke="#8bafc4"
          strokeWidth="3"
          strokeDasharray="3 12"
          strokeLinecap="round"
        />
        {stroke.length > 1 && (
          <polyline
            points={stroke.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="#40bda1"
            strokeWidth="35"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {index < points.length && (
          <circle
            cx={points[index][0]}
            cy={points[index][1]}
            r={hint >= 2 ? 20 : 15}
            fill="#169d74"
            stroke="white"
            strokeWidth="4"
          />
        )}
      </svg>
      <div className="trace-progress">
        <span style={{ width: `${(index / points.length) * 100}%` }} />
      </div>
      <button
        className="secondary"
        onClick={() => {
          last.current = 0;
          setIndex(0);
          setStroke([]);
        }}
      >
        {lang === "tr" ? "Baştan başla" : "Noch einmal beginnen"}
      </button>
    </div>
  );
}
