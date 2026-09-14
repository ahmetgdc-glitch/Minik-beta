import React from "react";
import { Art } from "../components/Visual.jsx";
import { decorationsForWorld } from "./scenes.js";

export default function WorldScenery({ worldId }) {
  return (
    <div className="world-scenery" aria-hidden="true">
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
