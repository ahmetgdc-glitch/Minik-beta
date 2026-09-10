import test from "node:test";
import assert from "node:assert/strict";
import { normalizeSpeech, speechMatches, speechRecognitionCtor } from "../src/games/pronunciation.js";

test("speech normalization handles German and Turkish casing", () => {
  assert.equal(normalizeSpeech("  KATZE! ", "de"), "katze");
  assert.equal(normalizeSpeech("İNEK", "tr"), "inek");
});

test("speech matching accepts exact words and harmless short prefixes", () => {
  assert.equal(speechMatches("Katze", "Katze", "de"), true);
  assert.equal(speechMatches("eine Katze", "Katze", "de"), true);
  assert.equal(speechMatches("Hund", "Katze", "de"), false);
});

test("recognition constructor supports standard and Safari prefixes", () => {
  function A(){}
  function B(){}
  assert.equal(speechRecognitionCtor({ SpeechRecognition: A }), A);
  assert.equal(speechRecognitionCtor({ webkitSpeechRecognition: B }), B);
  assert.equal(speechRecognitionCtor({}), null);
});

test("speech recognition errors distinguish permission, silence and temporary failures", async () => {
  const { recognitionIssue } = await import("../src/games/pronunciation.js");
  assert.equal(recognitionIssue("not-allowed", "de").kind, "permission");
  assert.equal(recognitionIssue("not-allowed", "de").retryable, false);
  assert.equal(recognitionIssue("no-speech", "tr").kind, "silence");
  assert.equal(recognitionIssue("network", "de").retryable, true);
  assert.equal(recognitionIssue("audio-capture", "tr").kind, "microphone");
});
