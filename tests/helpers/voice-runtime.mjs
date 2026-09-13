// Exercise the real voice module with browser boundaries supplied by each test.
let instance = 0;

export async function voiceRuntime(t, overrides = {}) {
  const document = Object.assign(new EventTarget(), {
    hidden: false,
    visibilityState: "visible",
    baseURI: "https://minik.example/Minik-beta/",
  });
  const values = {
    document,
    window: new EventTarget(),
    speechSynthesis: undefined,
    SpeechSynthesisUtterance: undefined,
    ...overrides,
  };
  const saved = new Map();
  for (const [key, value] of Object.entries(values)) {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  let voice;
  t.after(() => {
    voice?.stopSpeech();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  voice = await import(`../../src/audio/voice.js?runtime=${++instance}`);
  return { voice, ...values };
}
