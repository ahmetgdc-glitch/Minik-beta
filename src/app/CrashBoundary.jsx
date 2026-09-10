import React from "react";
import { Home, RotateCcw } from "lucide-react";
import { Mino } from "../components/Visual.jsx";
import { stopSpeech } from "../audio/voice.js";
import { stopSounds } from "../audio/sounds.js";

function crashCopy() {
  const tr = typeof document !== "undefined" && document.documentElement?.lang?.toLowerCase().startsWith("tr");
  return tr
    ? {
        title: "MINIK'in kısa bir yardıma ihtiyacı var",
        body: "Öğrenme ilerlemen kayıtlı kalır. Ana sayfayı açabilir veya MINIK'i yeniden yükleyebilirsin.",
        home: "Ana sayfa",
        reload: "Yeniden yükle",
      }
    : {
        title: "MINIK braucht kurz Hilfe",
        body: "Dein Lernfortschritt bleibt gespeichert. Öffne die Startseite oder lade MINIK neu.",
        home: "Startseite",
        reload: "Neu laden",
      };
}

export default class CrashBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error) {
    // A failed child screen must never leave old speech or WebAudio playing
    // behind the recovery UI, especially on iPhone/iPad.
    stopSpeech();
    stopSounds();
    try {
      console.error("MINIK recovered from a screen error", error);
    } catch {}
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const copy = crashCopy();
    return (
      <main className="crash-recovery" role="alert" aria-live="assertive">
        <Mino />
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <div>
          <button
            type="button"
            className="primary"
            onClick={() => {
              window.location.hash = "#/";
              this.setState({ failed: false });
            }}
          >
            <Home size={20} /> {copy.home}
          </button>
          <button type="button" className="secondary" onClick={() => window.location.reload()}>
            <RotateCcw size={20} /> {copy.reload}
          </button>
        </div>
      </main>
    );
  }
}
