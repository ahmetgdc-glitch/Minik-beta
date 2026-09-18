import React from "react";
import { Art } from "../components/Visual.jsx";
import { decorationsForWorld, sceneMomentForWorld } from "./scenes.js";

export default function WorldScenery({
  worldId,
  active = false,
  discovered = 0,
}) {
  const moment = sceneMomentForWorld(worldId);
  const discoveryCount = Number.isFinite(discovered)
    ? Math.max(0, Math.floor(discovered))
    : 0;
  const level =
    discoveryCount >= 6 ? 3 : discoveryCount >= 3 ? 2 : discoveryCount >= 1 ? 1 : 0;

  return (
    <div
      className={`world-scenery moment-${moment} discovery-level-${level} ${active ? "is-listening" : ""}`}
      data-discovered={discoveryCount}
      aria-hidden="true"
    >
      {decorationsForWorld(worldId).map((asset, index) => (
        <Art
          key={`${worldId}-${asset}`}
          name={asset}
          className={`scene-landmark landmark-${index + 1}`}
        />
      ))}
    </div>
  );
}
