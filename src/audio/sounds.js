let context = null,
  nodes = [],
  activeTimers = [],
  musicNodes = [],
  musicTimers = [],
  musicEnabled = false,
  musicPlaying = false,
  musicPhrase = 0;
const musicPauseReasons = new Set();

const MUSIC_PATTERNS = [
  [261.63, 329.63, 392, 523.25, 392, 329.63],
  [293.66, 369.99, 440, 587.33, 440, 369.99],
  [246.94, 329.63, 392, 493.88, 392, 329.63],
];

export function unlockAudio() {
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    if (context.state === "suspended") context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}
export async function ensureAudioReady() {
  const c = unlockAudio();
  if (!c) return null;
  try {
    if (c.state !== "running") await c.resume();
  } catch {}
  return c.state === "running" ? c : null;
}
export function stopSounds() {
  for (const n of nodes) {
    try {
      n.stop();
    } catch {}
  }
  nodes = [];
  activeTimers.forEach(clearTimeout);
  activeTimers = [];
}
function tone(
  frequency,
  start,
  duration,
  type = "sine",
  volume = 0.12,
  endFrequency,
) {
  const c = context;
  if (!c) return;
  const o = c.createOscillator(),
    g = c.createGain(),
    t = c.currentTime + start;
  o.type = type;
  o.frequency.setValueAtTime(frequency, t);
  if (endFrequency)
    o.frequency.exponentialRampToValueAtTime(endFrequency, t + duration);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + duration + 0.03);
  nodes.push(o);
  o.onended = () => {
    o.disconnect();
    g.disconnect();
    nodes = nodes.filter((n) => n !== o);
  };
}
function noise(start, duration, filter = "lowpass", freq = 700, volume = 0.12) {
  const c = context;
  if (!c) return;
  const buffer = c.createBuffer(
      1,
      Math.ceil(c.sampleRate * duration),
      c.sampleRate,
    ),
    data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource(),
    g = c.createGain(),
    f = c.createBiquadFilter(),
    t = c.currentTime + start;
  source.buffer = buffer;
  f.type = filter;
  f.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(volume, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  source.connect(f);
  f.connect(g);
  g.connect(c.destination);
  source.start(t);
  source.stop(t + duration);
  nodes.push(source);
  source.onended = () => {
    source.disconnect();
    f.disconnect();
    g.disconnect();
    nodes = nodes.filter((n) => n !== source);
  };
}

function clearBackgroundPlayback() {
  for (const n of musicNodes) {
    try {
      n.stop();
    } catch {}
  }
  musicNodes = [];
  musicTimers.forEach(clearTimeout);
  musicTimers = [];
  musicPlaying = false;
}

function backgroundMusicAllowed() {
  return Boolean(
    musicEnabled &&
      !musicPauseReasons.size &&
      context?.state === "running" &&
      !(typeof document !== "undefined" && document.visibilityState === "hidden"),
  );
}

function musicTone(frequency, start, duration, volume = 0.012, type = "triangle") {
  const c = context;
  if (!c) return;
  const oscillator = c.createOscillator(),
    gain = c.createGain(),
    when = c.currentTime + start;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(volume, when + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  oscillator.connect(gain);
  gain.connect(c.destination);
  oscillator.start(when);
  oscillator.stop(when + duration + 0.04);
  musicNodes.push(oscillator);
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
    musicNodes = musicNodes.filter((node) => node !== oscillator);
  };
}

function queueBackgroundPhrase() {
  if (!backgroundMusicAllowed() || musicPlaying) return false;
  musicPlaying = true;
  const pattern = MUSIC_PATTERNS[musicPhrase % MUSIC_PATTERNS.length];
  musicPhrase++;
  pattern.forEach((frequency, index) => {
    musicTone(frequency, index * 0.72, 0.58, 0.011);
  });
  [0, 1.44, 2.88].forEach((start, index) => {
    musicTone(pattern[index * 2] / 2, start, 1.2, 0.0065, "sine");
  });
  const timer = setTimeout(() => {
    musicTimers = musicTimers.filter((entry) => entry !== timer);
    musicPlaying = false;
    if (backgroundMusicAllowed()) queueBackgroundPhrase();
  }, 5600);
  musicTimers.push(timer);
  return true;
}

export function startBackgroundMusic() {
  if (!backgroundMusicAllowed()) return false;
  return musicPlaying || queueBackgroundPhrase();
}

export function setBackgroundMusicEnabled(enabled) {
  musicEnabled = Boolean(enabled);
  if (!musicEnabled) {
    clearBackgroundPlayback();
    return false;
  }
  return startBackgroundMusic();
}

export function pauseBackgroundMusic(reason = "app") {
  musicPauseReasons.add(reason);
  clearBackgroundPlayback();
}

export function resumeBackgroundMusic(reason = "app") {
  musicPauseReasons.delete(reason);
  return startBackgroundMusic();
}

export function stopBackgroundMusic() {
  musicEnabled = false;
  musicPauseReasons.clear();
  clearBackgroundPlayback();
}

export function playSound(kind, { sfx = true } = {}) {
  stopSounds();
  if (!sfx || !unlockAudio()) return 0;
  if (kind === "success") {
    [523, 659, 784].forEach((f, i) => tone(f, i * 0.11, 0.24, "sine", 0.05));
    return 500;
  }
  if (kind === "tap") {
    tone(620, 0, 0.07, "sine", 0.035);
    return 70;
  }
  if (kind === "bell") {
    [0, 0.7].forEach((t) => {
      tone(880, t, 0.7, "sine", 0.1);
      tone(1320, t, 0.45, "sine", 0.04);
    });
    return 1500;
  }
  if (kind === "phone") {
    for (let i = 0; i < 6; i++) {
      tone(660, i * 0.17, 0.1, "square", 0.025);
      tone(880, i * 0.17, 0.1, "sine", 0.04);
    }
    return 1200;
  }
  if (kind === "knock") {
    [0, 0.3, 0.6].forEach((t) => noise(t, 0.13, "bandpass", 260, 0.5));
    return 900;
  }
  if (kind === "clock") {
    for (let i = 0; i < 6; i++)
      noise(i * 0.35, 0.045, "bandpass", i % 2 ? 2200 : 1500, 0.25);
    return 2100;
  }
  if (kind === "rain") {
    for (let i = 0; i < 24; i++) noise(i * 0.065, 0.25, "highpass", 2100, 0.05);
    return 1800;
  }
  if (kind === "wind") {
    noise(0, 2, "lowpass", 420, 0.3);
    noise(0.3, 1.5, "bandpass", 750, 0.1);
    return 2100;
  }
  if (kind === "water") {
    [0, 0.45, 0.9, 1.25].forEach((t) =>
      tone(950, t, 0.19, "sine", 0.12, 300),
    );
    return 1500;
  }
  if (kind === "drum") {
    [0, 0.4, 0.8].forEach((t) => {
      tone(180, t, 0.2, "sine", 0.2, 50);
      noise(t, 0.09, "lowpass", 700, 0.08);
    });
    return 1200;
  }
  if (kind === "piano") {
    [261.6, 329.6, 392, 523.2].forEach((f, i) => {
      tone(f, i * 0.25, 0.5, "triangle", 0.1);
      tone(f * 2, i * 0.25, 0.25, "sine", 0.025);
    });
    return 1300;
  }
  if (kind === "flute") {
    [523, 587, 659, 784].forEach((f, i) =>
      tone(f, i * 0.28, 0.25, "sine", 0.13),
    );
    return 1400;
  }
  if (kind === "train") {
    for (let i = 0; i < 8; i++) noise(i * 0.19, 0.12, "bandpass", 600, 0.24);
    tone(440, 1, 0.55, "triangle", 0.065);
    tone(520, 1, 0.55, "triangle", 0.045);
    return 1800;
  }
  if (kind === "siren") {
    for (let i = 0; i < 4; i++)
      tone(
        i % 2 ? 900 : 450,
        i * 0.4,
        0.4,
        "sine",
        0.085,
        i % 2 ? 450 : 900,
      );
    return 1700;
  }
  return 0;
}
export async function playNote(note) {
  stopSounds();
  const c = await ensureAudioReady();
  if (!c) return false;
  tone([261.6, 329.6, 392, 523.2][note % 4], 0, 0.34, "triangle", 0.14);
  return true;
}
