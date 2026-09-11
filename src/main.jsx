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

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CrashBoundary><App /></CrashBoundary>
  </React.StrictMode>,
);

import { registerOffline } from "./app/offline.js";
registerOffline();
