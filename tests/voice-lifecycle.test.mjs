import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { voiceRuntime } from "./helpers/voice-runtime.mjs";

const voice = fs.readFileSync(new URL("../src/audio/voice.js", import.meta.url), "utf8");

test("MINIK stops every narrator when the page leaves the foreground", () => {
  assert.match(voice, /function bindSpeechLifecycle\(\)/);
  assert.match(voice, /window\.addEventListener\("pagehide", stopOnPageHide\)/);
  assert.match(voice, /document\.addEventListener\("visibilitychange", stopWhenHidden\)/);
  assert.match(voice, /if \(document\.hidden\) stopSpeech\(\)/);
  assert.match(voice, /const stopOnPageHide = \(\) => stopSpeech\(\)/);
  assert.match(voice, /bindSpeechLifecycle\(\)/);
});

test("hidden MINIK cannot start a delayed narrator after lifecycle cancellation", () => {
  assert.match(voice, /function speechForegroundAllowed\(\)/);
  assert.match(voice, /return !document\.hidden && document\.visibilityState !== "hidden"/);
  assert.match(voice, /if \(!text \|\| settings\.audio === false \|\| !speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /\(\) => token === sequence && speechForegroundAllowed\(\)/);
  assert.match(voice, /export async function cloudTTS[\s\S]*?if \(!speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /if \(token !== sequence \|\| !speechForegroundAllowed\(\)\) return false/);
});

for (const event of ["visibilitychange", "pagehide"]) {
  test(`${event} cancels pending fixed narration without starting another clip`, async (t) => {
    const played = [];
    let rejectPlay;
    class Audio {
      setAttribute() {}
      pause() {}
      load() {}
      play() {
        played.push(this.src);
        return new Promise((resolve, reject) => { rejectPlay = reject; });
      }
    }
    const { voice: api, document, window } = await voiceRuntime(t, { Audio });
    const pending = api.speak("Finde dieses Bild.", "de");
    assert.equal(played.length, 1);
    assert.match(played[0], /^https:\/\/minik\.example\/Minik-beta\/assets\/voice\//);

    if (event === "visibilitychange") {
      document.hidden = true;
      document.visibilityState = "hidden";
      document.dispatchEvent(new Event(event));
    } else {
      window.dispatchEvent(new Event(event));
    }
    assert.equal(await pending, false);
    rejectPlay(new Error("late browser playback rejection"));
    await Promise.resolve();
    assert.equal(played.length, 1, "cancelled narration cannot play a remote fallback or the next word");

    document.hidden = true;
    document.visibilityState = "hidden";
    assert.equal(await api.speak("Harika!", "tr"), false);
    assert.equal(played.length, 1, "hidden pages cannot begin new narration");
  });
}

test("audio priming and recorded playback stay blocked while hidden", () => {
  assert.match(voice, /export async function unlockVoiceAudio\(\) \{\n\s*if \(!speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /async function speakMediaClip\(url, token\) \{\n\s*if \(!url \|\| !speechForegroundAllowed\(\)\) return false/);
  assert.match(voice, /async function speakGameClip\(url, token\) \{\n\s*if \(!url \|\| !speechForegroundAllowed\(\)\) return false/);
});

test("global lifecycle cancellation reaches Voice 4 and recorded fallbacks", () => {
  const stopStart = voice.indexOf("export function stopSpeech()");
  const lifecycleStart = voice.indexOf("function bindSpeechLifecycle()");
  assert.ok(stopStart >= 0 && lifecycleStart > stopStart);
  const stopBody = voice.slice(stopStart, lifecycleStart);
  assert.match(stopBody, /stopSystemVoice4\(\)/);
  assert.match(stopBody, /voiceSource\?\.stop\(\)/);
  assert.match(stopBody, /voicePlayer\?\.pause\(\)/);
  assert.match(stopBody, /cloudAbort\?\.abort\(\)/);
});
