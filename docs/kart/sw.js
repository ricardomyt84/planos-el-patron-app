/* El Patrón Kart · service worker: funciona sin internet y carga rápido. */
const C='kart-v4-1';
const CORE=['./','index.html','v4.js','manifest.webmanifest','head-patron.png','personaje.jpg','icon-192.png','icon-512.png','apple-touch-icon.png','voces/voices.json','cancion.m4a','instrumental.m4a'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('kart-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function rangeResp(req,hit){const buf=await hit.arrayBuffer();const m=/bytes=(\d+)-(\d*)/.exec(req.headers.get('range')||'');if(!m)return hit;const s=+m[1],e=m[2]?Math.min(+m[2],buf.byteLength-1):buf.byteLength-1;
  return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':hit.headers.get('Content-Type')||'audio/mp4','Content-Range':`bytes ${s}-${e}/${buf.byteLength}`,'Content-Length':String(e-s+1)}})}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  e.respondWith((async()=>{const c=await caches.open(C);const isRange=r.headers.has('range');const hit=await c.match(r.url);
    if(isRange){if(hit)return rangeResp(r,hit);return fetch(r)}
    const net=fetch(r).then(res=>{if(res&&res.status===200&&res.type==='basic')c.put(r,res.clone()).catch(()=>{});return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    const res=await net;return res||new Response('Sin conexión',{status:503})})())});
