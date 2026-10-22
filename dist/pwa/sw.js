// Service worker de LECAA Tecla: tot el joc queda desat per funcionar sense connexió.
// La memòria cau (CacheStorage) és compartida per tot l'origen utacub.github.io: aquest service worker
// només crea, llegeix i esborra memòries que comencen per PREFIX i no toca les de les altres apps.
const PREFIX = "lecaa-tecla-";
const CACHE = PREFIX + "ea841d3147";
const FILES = ["./", "index.html", "manifest.webmanifest", "icones/icona-192.png", "icones/icona-512.png", "icones/icona-maskable-512.png", "icones/icona-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// primer la còpia desada (funciona sense xarxa); una versió nova s'instal·la en segon pla i entra la propera vegada
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return; // les veus Piper es baixen directament (i es desen a IndexedDB)
  e.respondWith(caches.match(e.request, { cacheName: CACHE, ignoreSearch: true }).then(r => r || fetch(e.request)));
});
