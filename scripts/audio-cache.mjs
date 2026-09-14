// These functions are also embedded in the classic production service worker.
// Keep browser dependencies inside them; no runtime imports or app startup work.
export async function audioRangeResponse(request, response) {
  const range = request.headers.get("Range");
  if (!range || response.status !== 200) return response;

  // A changed representation must be sent in full (HTTP If-Range semantics).
  const validator = request.headers.get("If-Range");
  if (validator) {
    const matches = validator.startsWith('"')
      ? validator === response.headers.get("ETag")
      : !validator.startsWith("W/") &&
        Number.isFinite(Date.parse(validator)) &&
        validator === response.headers.get("Last-Modified");
    if (!matches) return response;
  }

  // Unsupported units, malformed or multipart ranges may be ignored with 200.
  const parts = /^bytes=(\d*)-(\d*)$/i.exec(range.trim());
  if (!parts || (!parts[1] && !parts[2])) return response;
  const blob = await response.blob();
  const size = blob.size;
  const first = parts[1] ? Number(parts[1]) : null;
  const last = parts[2] ? Number(parts[2]) : null;
  const start = first ?? Math.max(0, size - last);
  const end = first === null || last === null ? size - 1 : Math.min(last, size - 1);
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  // Fetch exposes decoded bytes; inherited wire encoding/length would be wrong.
  headers.delete("Content-Encoding");
  if (!Number.isSafeInteger(start) || start < 0 || start >= size || end < start) {
    headers.set("Content-Range", `bytes */${size}`);
    headers.set("Content-Length", "0");
    return new Response(null, { status: 416, headers });
  }
  const body = blob.slice(start, end + 1, blob.type);
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(body.size));
  return new Response(body, { status: 206, headers });
}

export function createAudioCacheHandler(fetchAudio = fetch) {
  const pending = new Map();
  function completeClip(cache, request) {
    if (pending.has(request.url)) return pending.get(request.url);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const task = (async () => {
      // A partial media response cannot be stored with Cache.put. Warm only this
      // requested clip, independently of the media element's playback/cancel.
      const response = await fetchAudio(request, { signal: controller.signal });
      if (response.status === 200 && ["basic", "cors"].includes(response.type)) {
        await cache.put(request, response);
      }
    })().catch(() => {}).finally(() => {
      clearTimeout(timer);
      pending.delete(request.url);
    });
    pending.set(request.url, task);
    return task;
  }

  return function handleAudioRange(event, cachePromise) {
    const headers = new Headers(event.request.headers);
    headers.delete("Range");
    headers.delete("If-Range");
    const fullRequest = new Request(event.request, { headers });
    const result = Promise.resolve(cachePromise).then(async (cache) => {
      const hit = await cache.match(fullRequest);
      if (hit?.status === 200) {
        return { response: await audioRangeResponse(event.request, hit) };
      }
      const response = await fetchAudio(event.request);
      let storing;
      if (["basic", "cors"].includes(response.type)) {
        if (response.status === 200) {
          storing = cache.put(fullRequest, response.clone()).catch(() => {});
        } else if (response.status === 206) {
          storing = completeClip(cache, fullRequest);
        }
      }
      return { response, storing };
    });
    // Register both promises during dispatch. Playback never awaits the full
    // cache download, and waitUntil keeps that work alive after respondWith.
    event.respondWith(result.then(({ response }) => response));
    event.waitUntil(result.then(({ storing }) => storing).catch(() => {}));
  };
}
