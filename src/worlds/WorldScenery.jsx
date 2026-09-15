import React from "react";
import { Art } from "../components/Visual.jsx";
import { decorationsForWorld, sceneMomentForWorld } from "./scenes.js";

export default function WorldScenery({ worldId, active = false }) {
  const moment = sceneMomentForWorld(worldId);
  return (
    <div
      className={`world-scenery moment-${moment} ${active ? "is-listening" : ""}`}
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
