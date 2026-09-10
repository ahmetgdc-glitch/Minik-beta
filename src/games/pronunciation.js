export function normalizeSpeech(text, lang = "de") {
  return String(text || "")
    .toLocaleLowerCase(lang === "tr" ? "tr-TR" : "de-DE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9äöüßçğıöşü\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function speechMatches(spoken, expected, lang = "de") {
  const a = normalizeSpeech(spoken, lang);
  const b = normalizeSpeech(expected, lang);
  if (!a || !b) return false;
  if (a === b) return true;
  // Child speech recognizers often add an article or a short filler word.
  return (` ${a} `).includes(` ${b} `);
}

export function speechRecognitionCtor(scope = globalThis) {
  return scope?.SpeechRecognition || scope?.webkitSpeechRecognition || null;
}

export function recognitionIssue(code, lang = "de") {
  const tr = lang === "tr";
  const key = String(code || "").toLowerCase();
  if (["not-allowed", "service-not-allowed"].includes(key)) {
    return {
      kind: "permission",
      retryable: false,
      text: tr
        ? "Mikrofon izni kapalı. İzinleri açabilir ya da kelimeyi Mino ile birlikte söyleyebilirsin."
        : "Der Mikrofonzugriff ist ausgeschaltet. Du kannst die Berechtigung erlauben oder das Wort einfach mit Mino mitsprechen.",
    };
  }
  if (key === "audio-capture") {
    return {
      kind: "microphone",
      retryable: true,
      text: tr ? "Mikrofon şu anda kullanılamıyor. Birazdan yeniden dene." : "Das Mikrofon ist gerade nicht verfügbar. Versuch es gleich noch einmal.",
    };
  }
  if (key === "network") {
    return {
      kind: "network",
      retryable: true,
      text: tr ? "Konuşma tanıma şu anda bağlantı kuramıyor. Yeniden deneyebilirsin." : "Die Spracherkennung hat gerade keine Verbindung. Du kannst es noch einmal versuchen.",
    };
  }
  if (key === "no-speech") {
    return {
      kind: "silence",
      retryable: true,
      text: tr ? "Seni duyamadım. Biraz daha yüksek sesle tekrar söyle." : "Ich habe dich noch nicht gehört. Sag das Wort noch einmal etwas lauter.",
    };
  }
  return {
    kind: "unknown",
    retryable: true,
    text: tr ? "Seni bu kez anlayamadım. Yeniden deneyebilirsin." : "Ich konnte dich diesmal nicht verstehen. Versuch es noch einmal.",
  };
}
