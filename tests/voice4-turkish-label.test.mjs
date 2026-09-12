import test from "node:test";
import assert from "node:assert/strict";

const mod = await import(`../src/audio/systemVoice4.js?turkish-label=${Date.now()}`);

test("Turkish-localized iOS Voice 4 labels remain eligible narrators", () => {
  const plain = { name: "Ses 4", voiceURI: "com.apple.siri.tr-TR.voice4", lang: "tr-TR" };
  const siri = { name: "Siri Ses 4", voiceURI: "com.apple.siri.tr-TR.voice4.alt", lang: "tr-TR" };
  const robot = { name: "Yelda", voiceURI: "com.apple.voice.compact.tr-TR.Yelda", lang: "tr-TR" };

  assert.equal(mod.isVoice4Candidate(plain), true);
  assert.equal(mod.isVoice4Candidate(siri), true);
  assert.equal(mod.isVoice4Candidate(robot), false);
  assert.equal(mod.selectVoice4([robot, plain], "tr"), plain);
});
