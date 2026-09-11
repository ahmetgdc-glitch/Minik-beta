import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, Check } from "lucide-react";
import Visual from "../components/Visual.jsx";
import { speak } from "../audio/voice.js";
import { sample } from "../utils/random.js";
import { useLesson } from "./shared.jsx";
import { recognitionIssue, speechMatches, speechRecognitionCtor } from "./pronunciation.js";

export default function SpeakGame({ items, lang, settings, paused, hint, interactionBlocked = () => false, onReady, onWrong, onSolve }) {
  const [target] = useState(() => sample(items.filter((i) => i.labels?.[lang]), 1)[0]);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [issue, setIssue] = useState(null);
  const [available] = useState(() => Boolean(speechRecognitionCtor(typeof window !== "undefined" ? window : {})));
  const recognitionRef = useRef(null);
  const expected = target?.labels?.[lang] || "";
  const prompt = lang === "tr" ? `Benimle söyle: ${expected}` : `Sprich mir nach: ${expected}`;
  const blocked = interactionBlocked();

  function repeat() {
    if (paused || blocked) return;
    speak(expected, lang, settings);
  }
  useLesson(onReady, prompt, repeat, [target?.id].filter(Boolean), expected);

  function stopRecognition() {
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    if (rec) {
      rec.onstart = null;
      rec.onend = null;
      rec.onerror = null;
      rec.onresult = null;
      try { rec.abort?.(); } catch {}
    }
    setListening(false);
  }

  useEffect(() => () => stopRecognition(), []);
  useEffect(() => {
    if (paused || blocked) stopRecognition();
  }, [paused, blocked]);

  function startListening() {
    if (!available || listening || paused || blocked) return;
    setIssue(null);
    setHeard("");
    const Ctor = speechRecognitionCtor(window);
    if (!Ctor) return;
    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = lang === "tr" ? "tr-TR" : "de-DE";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;
    rec.onstart = () => {
      if (recognitionRef.current === rec && !interactionBlocked()) setListening(true);
    };
    rec.onend = () => {
      if (recognitionRef.current !== rec) return;
      recognitionRef.current = null;
      setListening(false);
    };
    rec.onerror = (event) => {
      if (recognitionRef.current !== rec) return;
      recognitionRef.current = null;
      setListening(false);
      if (String(event?.error || "").toLowerCase() === "aborted") return;
      if (interactionBlocked()) return;
      setIssue(recognitionIssue(event?.error, lang));
    };
    rec.onresult = (event) => {
      if (recognitionRef.current !== rec) return;
      if (paused || interactionBlocked()) {
        stopRecognition();
        return;
      }
      const alternatives = Array.from(event.results?.[0] || []).map((r) => r.transcript || "");
      const best = alternatives[0] || "";
      stopRecognition();
      setHeard(best);
      if (alternatives.some((text) => speechMatches(text, expected, lang))) onSolve([target.id]);
      else onWrong([target.id]);
    };
    try { rec.start(); } catch { stopRecognition(); }
  }

  function assistedSolve() {
    if (paused || blocked) return;
    onSolve([target.id], { assisted: true });
  }

  if (!target) return null;
  return (
    <div className="speak-game" aria-disabled={paused || blocked || undefined}>
      <div className="speak-hero">
        <Visual item={target} lang={lang} photos={settings.photos} />
        <strong>{expected}</strong>
        <button className="speak-repeat" onClick={repeat} disabled={paused || blocked} aria-label={lang === "tr" ? "Kelimeyi tekrar dinle" : "Wort noch einmal hören"}>
          <Volume2 size={28} />
        </button>
      </div>
      {available ? (
        <>
          <button className={`mic-button ${listening ? "listening" : ""}`} onClick={startListening} disabled={listening || paused || blocked}>
            {listening ? <MicOff size={38} /> : <Mic size={38} />}
            <span>{listening ? (lang === "tr" ? "Dinliyorum…" : "Ich höre…") : (lang === "tr" ? "Söyle" : "Nachsprechen")}</span>
          </button>
          {heard && <p className="heard-speech">{lang === "tr" ? "Duydum:" : "Gehört:"} <b>{heard}</b></p>}
          {issue && <p className={`speech-issue ${issue.kind}`} role="status">{issue.text}</p>}
          {issue?.kind === "permission" && (
            <button className="secondary speak-assisted" onClick={assistedSolve} disabled={paused || blocked}>
              <Check size={22} /> {lang === "tr" ? "Mino ile söyledim" : "Ich habe mit Mino mitgesprochen"}
            </button>
          )}
        </>
      ) : (
        <div className="speech-fallback">
          <p>{lang === "tr" ? "Bu cihaz konuşma tanımayı desteklemiyor. Kelimeyi yüksek sesle söyle." : "Dieses Gerät unterstützt keine Spracherkennung. Sprich das Wort laut nach."}</p>
          <button className="primary" onClick={assistedSolve} disabled={paused || blocked}>
            <Check size={24} /> {lang === "tr" ? "Söyledim" : "Ich habe es gesagt"}
          </button>
        </div>
      )}
      {hint >= 2 && <p className="speak-hint">{lang === "tr" ? `Yavaşça söyle: ${expected}` : `Sag langsam: ${expected}`}</p>}
    </div>
  );
}
