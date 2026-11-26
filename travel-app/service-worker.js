const CACHE='ridebook-__VERSION__';
const SHELL='/ridebook/';
const ASSETS=[SHELL,'/ridebook/manifest.webmanifest','/travel-assets/icon-192.png','/travel-assets/icon-512.png','/travel-assets/apple-touch-icon.png'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(ASSETS.map(url=>new Request(url,{cache:'reload'})));})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('ridebook-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
// Updates activate only after the open app has saved changes and the user selects Apply.
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
 const path=url.pathname;
 // No private API, authentication pages, maps, or user data are cached.
 if(!ASSETS.includes(path)&&path!=='/ridebook/index.html')return;
 const key=path==='/ridebook/index.html'?SHELL:path;
 event.respondWith((async()=>{const cached=await (await caches.open(CACHE)).match(key);return cached||fetch(event.request);})());
});
