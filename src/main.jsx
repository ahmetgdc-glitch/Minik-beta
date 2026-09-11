import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import CrashBoundary from "./app/CrashBoundary.jsx";
import "@fontsource/nunito/latin-400.css";
import "@fontsource/nunito/latin-600.css";
import "@fontsource/nunito/latin-700.css";
import "@fontsource/nunito/latin-800.css";
import "@fontsource/nunito/latin-900.css";
import "@fontsource/nunito/latin-ext-400.css";
import "@fontsource/nunito/latin-ext-600.css";
import "@fontsource/nunito/latin-ext-700.css";
import "@fontsource/nunito/latin-ext-800.css";
import "@fontsource/nunito/latin-ext-900.css";
import "./styles.css";
import "./games/games.css";
import "./worlds/worlds.css";
import "./games/immersive.css";
import "./app/playground.css";
import "./rewards/immersive-rewards.css";
import "./rewards/achievement-trail.css";
import "./games/story-journey.css";
import "./games/routine-journey.css";
import "./games/memory-playground.css";
import "./games/difference-playground.css";
import "./games/missing-stage.css";
import "./games/opposites-playground.css";
import "./games/pattern-path.css";
import "./games/letter-playground.css";
import "./games/listen-playground.css";
import "./games/shadow-playground.css";
import "./games/sound-stage.css";
import "./games/review-island.css";
import "./games/puzzle-playground.css";
import "./games/social-journey.css";
import "./games/trace-playground.css";
import "./games/speak-stage.css";
import "./games/rhythm-playground.css";
import "./games/sort-workshop.css";
import "./games/count-meadow.css";
import "./games/match-playground.css";
import "./games/draw-coloring.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CrashBoundary><App /></CrashBoundary>
  </React.StrictMode>,
);

import { registerOffline } from "./app/offline.js";
registerOffline();
