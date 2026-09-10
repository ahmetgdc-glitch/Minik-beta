import React from "react";
import { ArrowUpRight, Star } from "lucide-react";
import { Art } from "./Visual.jsx";
export default function WorldCard({ world, lang, onOpen, progress }) {
  const completed = progress?.worlds?.[`${lang}:${world.id}`]?.correct || 0;
  return (
    <button
      className="world-card"
      style={{ "--world-color": world.color }}
      onClick={() => onOpen(world)}
    >
      <div className="world-picture">
        <Art name={world.asset} />
        <span className="world-open">
          <ArrowUpRight size={21} />
        </span>
        {completed > 0 && (
          <span className="world-earned">
            <Star size={14} fill="currentColor" />
            {completed}
          </span>
        )}
      </div>
      <div className="world-caption">
        <h3>{world.labels[lang]}</h3>
        <span>
          {world.items.length} {lang === "tr" ? "keşif" : "Entdeckungen"}
        </span>
      </div>
    </button>
  );
}
