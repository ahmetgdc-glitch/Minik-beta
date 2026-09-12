let context = null,
  nodes = [],
  activeTimers = [],
  musicTimer = null,
  musicNodes = [];
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
/** Start a very quiet, deterministic child-friendly loop after a real gesture. */
export function startMusic({ enabled = true } = {}) {
  if (!enabled || musicTimer || !unlockAudio()) return false;
  const notes = [261.6, 329.6, 392, 329.6, 293.7, 349.2, 440, 349.2];
  let index = 0;
  const playBar = () => {
    if (!context || context.state !== "running") return;
    const frequency = notes[index++ % notes.length];
    const o = context.createOscillator(), g = context.createGain();
    const now = context.currentTime;
    o.type = "triangle";
    o.frequency.setValueAtTime(frequency, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.018, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.62);
    o.connect(g); g.connect(context.destination); o.start(now); o.stop(now + 0.66);
    musicNodes.push(o);
    o.onended = () => { o.disconnect(); g.disconnect(); musicNodes = musicNodes.filter((n) => n !== o); };
  };
  playBar();
  musicTimer = window.setInterval(playBar, 720);
  return true;
}
export function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  musicNodes.forEach((n) => { try { n.stop(); } catch {} });
  musicNodes = [];
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
    [0, 0.45, 0.9, 1.25].forEach((t) => tone(950, t, 0.19, "sine", 0.12, 300));
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
      tone(i % 2 ? 900 : 450, i * 0.4, 0.4, "sine", 0.085, i % 2 ? 450 : 900);
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
