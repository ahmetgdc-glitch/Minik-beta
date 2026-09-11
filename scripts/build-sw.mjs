import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve("dist");
const pkg = JSON.parse(await fs.readFile(path.resolve("package.json"), "utf8"));

async function walk(dir) {
  let out = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(path.relative(root, p));
  }
  return out;
}

const files = (await walk(root)).filter(
  (p) => p !== "sw.js" && !p.startsWith("licenses/"),
);
const revision = crypto.createHash("sha256");
for (const file of files.sort()) {
  revision.update(file);
  revision.update(await fs.readFile(path.join(root, file)));
}
const safeVersion = String(pkg.version || "dev").replace(/[^a-zA-Z0-9._-]/g, "-");
const cache = `minik-${safeVersion}-${revision.digest("hex").slice(0, 12)}`;

// Keep first install deliberately small. iOS Safari can terminate a tab when a
// service worker opens hundreds of image/audio requests while React and WebAudio
// start at the same time. Rich assets and voices are cached on demand below.
const firstScenes = new Set([
  "assets/scenes/archipelago.webp",
  "assets/scenes/meadow.webp",
  "assets/scenes/playroom.webp",
]);
const initial = files.filter(
  (p) =>
    p === "index.html" ||
    p === "manifest.webmanifest" ||
    p.startsWith("icon-") ||
    p.startsWith("assets/mascot/") ||
    /assets\/.*\.(js|css|woff2)$/.test(p) ||
    firstScenes.has(p) ||
    p === "assets/content-manifest.json",
);

const code = `const PREFIX='minik:'+self.registration.scope+':';
const CACHE=PREFIX+${JSON.stringify(cache)};
const CORE=${JSON.stringify(initial.map((p) => "./" + p))};
const NAV_TIMEOUT_MS=3500;
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);if(url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 // Recovery must always reach the network and must never be replaced with the SPA shell.
 if(url.pathname.endsWith('/reset.html'))return;
 if(event.request.mode==='navigate'){
  event.respondWith((async()=>{
   const cache=await caches.open(CACHE);
   const fallback=()=>cache.match(new URL('./index.html',self.registration.scope).href);
   const controller=typeof AbortController!=='undefined'?new AbortController():null;
   const timer=controller?setTimeout(()=>controller.abort(),NAV_TIMEOUT_MS):null;
   try{
    const response=await fetch(event.request,controller?{signal:controller.signal}:undefined);
    if(response?.ok){await cache.put(new URL('./index.html',self.registration.scope).href,response.clone());return response}
    const cached=await fallback();
    return cached||response;
   }catch(error){const cached=await fallback();if(cached)return cached;throw error}
   finally{if(timer)clearTimeout(timer)}
  })());return
 }
 event.respondWith(caches.open(CACHE).then(async cache=>{const hit=await cache.match(event.request);if(hit)return hit;const response=await fetch(event.request);if(response.ok&&response.type==='basic')await cache.put(event.request,response.clone());return response}));
});
`;
await fs.writeFile(path.join(root, "sw.js"), code);
console.log(
  `PWA: ${initial.length} lightweight boot files; versioned cache ${cache}; rich assets cached on demand`,
);
