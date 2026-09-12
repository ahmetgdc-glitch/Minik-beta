import test from "node:test";
import assert from "node:assert/strict";

const mod = await import(`../src/audio/systemVoice4.js?candidate-strictness=${Date.now()}`);

test("generic Siri voices are never accepted as iOS Voice 4", () => {
  assert.equal(mod.isVoice4Candidate({ name: "Siri", voiceURI: "com.apple.siri", lang: "de-DE" }), false);
  assert.equal(mod.isVoice4Candidate({ name: "Siri Voice 2", voiceURI: "com.apple.siri.voice2", lang: "de-DE" }), false);
  assert.equal(mod.isVoice4Candidate({ name: "Siri Stimme 1", voiceURI: "com.apple.siri.voice1", lang: "de-DE" }), false);
});

test("explicit Voice 4 identities remain valid", () => {
  assert.equal(mod.isVoice4Candidate({ name: "Stimme 4", voiceURI: "com.apple.voice4", lang: "de-DE" }), true);
  assert.equal(mod.isVoice4Candidate({ name: "Voice 4", voiceURI: "com.apple.voice4.en", lang: "en-US" }), true);
  assert.equal(mod.isVoice4Candidate({ name: "Siri Voice 4", voiceURI: "com.apple.siri.voice4", lang: "de-DE" }), true);
  assert.equal(mod.isVoice4Candidate({ name: "Siri 4", voiceURI: "com.apple.siri4", lang: "tr-TR" }), true);
});
