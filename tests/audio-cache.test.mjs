import test from "node:test";
import assert from "node:assert/strict";
import { audioRangeResponse, createAudioCacheHandler } from "../scripts/audio-cache.mjs";

const url = "https://minik.example/Minik-beta/assets/voice/clip.mp3";
const request = (range, extra = {}) => new Request(url, { headers: { Range: range, ...extra } });
function recording(body = "0123456789", status = 200, extra = {}) {
  const response = new Response(body, { status, headers: { "Content-Type": "audio/mpeg", ...extra } });
  Object.defineProperty(response, "type", { value: "basic" });
  return response;
}
function storage({ full = null, quota = false } = {}) {
  return {
    full,
    async match() { return this.full?.clone(); },
    async put(key, response) {
      assert.equal(response.status, 200, "Cache API forbids partial responses");
      assert.equal(key.headers.has("Range"), false);
      assert.equal(key.headers.has("If-Range"), false);
      if (quota) throw new Error("QuotaExceededError");
      this.full = new Response(await response.arrayBuffer(), { headers: response.headers });
    },
  };
}
function dispatch(handler, cache, incoming = request("bytes=0-1")) {
  let response;
  let complete;
  handler({
    request: incoming,
    respondWith(promise) { response = promise; },
    waitUntil(promise) { complete = promise; },
  }, Promise.resolve(cache));
  assert.ok(response && complete, "Both fetch lifetimes must be registered synchronously");
  return { response, complete };
}

test("cached audio returns exact bounded, open-ended and suffix byte ranges", async () => {
  for (const [range, text, span] of [
    ["bytes=0-1", "01", "0-1"],
    ["bytes=4-", "456789", "4-9"],
    ["bytes=-3", "789", "7-9"],
    ["bytes=8-999", "89", "8-9"],
    ["bytes=-999", "0123456789", "0-9"],
  ]) {
    const response = await audioRangeResponse(request(range), recording(undefined, 200, { "Content-Encoding": "gzip" }));
    assert.equal(response.status, 206, range);
    assert.equal(response.headers.get("Content-Range"), `bytes ${span}/10`);
    assert.equal(response.headers.get("Content-Length"), String(text.length));
    assert.equal(response.headers.get("Accept-Ranges"), "bytes");
    assert.equal(response.headers.get("Content-Type"), "audio/mpeg");
    assert.equal(response.headers.get("Content-Encoding"), null);
    assert.equal(await response.text(), text);
  }
});

test("out-of-bounds or empty audio ranges return a bounded 416 response", async () => {
  for (const range of ["bytes=10-", "bytes=8-2", "bytes=-0", "bytes=999999999999999999999999999999-"]) {
    const response = await audioRangeResponse(request(range), recording());
    assert.equal(response.status, 416, range);
    assert.equal(response.headers.get("Content-Range"), "bytes */10");
    assert.equal(await response.text(), "");
  }
  assert.equal((await audioRangeResponse(request("bytes=0-1"), recording(""))).status, 416);
});

test("unsupported ranges and mismatched If-Range retain the complete recording", async () => {
  for (const range of ["items=0-1", "bytes=0-1,4-5", "bytes=bad", "bytes=-"]) {
    const full = recording();
    assert.equal(await audioRangeResponse(request(range), full), full);
    assert.equal(await full.text(), "0123456789");
  }
  const date = "Mon, 14 Sep 2026 10:00:00 GMT";
  for (const [validator, expected] of [['"current"', 206], ['"old"', 200], ['W/"current"', 200], [date, 206], ["bad-date", 200]]) {
    const full = recording(undefined, 200, { ETag: '"current"', "Last-Modified": date });
    const response = await audioRangeResponse(request("bytes=0-1", { "If-Range": validator }), full);
    assert.equal(response.status, expected, validator);
  }
});

test("cached audio plays repeated ranges offline without consuming the stored clip", async () => {
  const cache = storage({ full: recording() });
  const handler = createAudioCacheHandler(() => { throw new Error("offline"); });
  for (const range of ["bytes=0-1", "bytes=2-", "bytes=-4", "bytes=0-1"]) {
    const event = dispatch(handler, cache, request(range));
    assert.equal((await event.response).status, 206);
    await event.complete;
  }
  assert.equal(await cache.full.text(), "0123456789");
});

test("a streamed clip starts before its complete offline copy downloads, and warmups are deduplicated", async () => {
  const cache = storage();
  let finishDownload;
  const downloading = new Promise((resolve) => { finishDownload = resolve; });
  let rangedCalls = 0;
  let fullCalls = 0;
  const handler = createAudioCacheHandler(async (incoming) => {
    if (incoming.headers.has("Range")) {
      rangedCalls++;
      return recording("01", 206, { "Content-Range": "bytes 0-1/10" });
    }
    fullCalls++;
    return downloading;
  });
  const first = dispatch(handler, cache);
  const second = dispatch(handler, cache);
  assert.equal(await (await first.response).text(), "01");
  assert.equal(await (await second.response).text(), "01");
  assert.equal(cache.full, null, "Playback must not await the complete download");
  assert.equal(fullCalls, 1);
  finishDownload(recording());
  await Promise.all([first.complete, second.complete]);
  const offline = dispatch(handler, cache, request("bytes=5-"));
  assert.equal(await (await offline.response).text(), "56789");
  await offline.complete;
  assert.equal(rangedCalls, 2, "The next range must come from the full cache entry");
});

test("quota errors and failed full downloads cannot discard a playable partial response", async () => {
  for (const failure of ["quota", "network", "partial"]) {
    const cache = storage({ quota: failure === "quota" });
    const handler = createAudioCacheHandler(async (incoming) => {
      if (incoming.headers.has("Range")) return recording("01", 206);
      if (failure === "network") throw new Error("offline");
      return recording(undefined, failure === "partial" ? 206 : 200);
    });
    const event = dispatch(handler, cache);
    assert.equal(await (await event.response).text(), "01");
    await event.complete;
    assert.equal(cache.full, null);
  }
});

test("a failed cache warmup can retry and does not inherit the media cancellation signal", async () => {
  const cache = storage();
  const controller = new AbortController();
  let attempts = 0;
  const handler = createAudioCacheHandler(async (incoming, options) => {
    if (incoming.headers.has("Range")) return recording("01", 206);
    attempts++;
    controller.abort();
    assert.equal(options.signal.aborted, false);
    if (attempts === 1) throw new Error("temporary connection failure");
    return recording();
  });
  const event = dispatch(handler, cache, new Request(request("bytes=0-1"), { signal: controller.signal }));
  await event.response;
  await event.complete;
  const retry = dispatch(handler, cache);
  await retry.response;
  await retry.complete;
  assert.equal(attempts, 2);
  assert.equal(await cache.full.text(), "0123456789");
});

test("a server that ignores Range stores the full response without another download", async () => {
  let calls = 0;
  const cache = storage();
  const handler = createAudioCacheHandler(async () => { calls++; return recording(); });
  const event = dispatch(handler, cache);
  assert.equal(await (await event.response).text(), "0123456789");
  await event.complete;
  const next = dispatch(handler, cache);
  assert.equal((await next.response).status, 206);
  await next.complete;
  assert.equal(calls, 1);
});

test("a stalled background copy times out without delaying the media response", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const cache = storage();
  let signal;
  const handler = createAudioCacheHandler(async (incoming, options) => {
    if (incoming.headers.has("Range")) return recording("01", 206);
    signal = options.signal;
    return new Promise((_, reject) => {
      signal.addEventListener("abort", () => reject(new Error("AbortError")), { once: true });
    });
  });
  const event = dispatch(handler, cache);
  assert.equal(await (await event.response).text(), "01");
  t.mock.timers.tick(10000);
  await event.complete;
  assert.equal(signal.aborted, true);
  assert.equal(cache.full, null);
});
