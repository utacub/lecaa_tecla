#!/usr/bin/env python3
"""Munta la versió PWA instal·lable a dist/pwa/ (cal servir-la per HTTPS) i en fa un zip."""
import hashlib, json, os, shutil, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "dist", "pwa")
reuse_icons = "--keep-icons" in sys.argv
if not reuse_icons:
    shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT, exist_ok=True)
subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build.py"), os.path.join(OUT, "index.html")], check=True, env=dict(os.environ, PWA="1"))
if not reuse_icons:
    subprocess.run(["node", os.path.join(ROOT, "tools", "icons.js"), os.path.join(OUT, "icones")], check=True)
manifest = {
    "name": "LECAA Tecla", "short_name": "Tecla", "lang": "ca", "dir": "ltr",
    "description": "Juga i descobreix on viu cada lletra del teclat.",
    # id, start_url i scope amb el camí propi de l'app: un id relatiu ("./") es resol contra l'ORIGEN
    # de start_url (https://utacub.github.io/), i totes les apps del mateix domini quedarien amb el
    # mateix id; el navegador les tractaria com una sola app i les actualitzacions es trepitjarien.
    "id": "/lecaa_tecla/", "start_url": "/lecaa_tecla/", "scope": "/lecaa_tecla/",
    "display": "fullscreen", "display_override": ["fullscreen", "standalone"],
    "orientation": "landscape", "background_color": "#203E42", "theme_color": "#17676B",
    "categories": ["education", "games", "kids"],
    "icons": [
        {"src": "icones/icona-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "icones/icona-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
        {"src": "icones/icona-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
    ],
}
json.dump(manifest, open(os.path.join(OUT, "manifest.webmanifest"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
# "./" i "index.html" són el mateix document: només es desa "./" perquè la instal·lació no baixi i desi dues vegades l'HTML.
files = ["./", "manifest.webmanifest", "icones/icona-192.png", "icones/icona-512.png", "icones/icona-maskable-512.png", "icones/icona-180.png"]
ver = hashlib.sha256(open(os.path.join(OUT, "index.html"), "rb").read()).hexdigest()[:10]
sw = f"""// Service worker de LECAA Tecla: tot el joc queda desat per funcionar sense connexió.
// La memòria cau (CacheStorage) és compartida per tot l'origen utacub.github.io: aquest service worker
// només crea, llegeix i esborra memòries que comencen per PREFIX i no toca les de les altres apps.
const PREFIX = "lecaa-tecla-";
const CACHE = PREFIX + "{ver}";
const FILES = {json.dumps(files)};
self.addEventListener("install", e => {{ e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); }});
self.addEventListener("activate", e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
// primer la còpia desada (funciona sense xarxa); una versió nova s'instal·la en segon pla i entra la propera vegada
self.addEventListener("fetch", e => {{
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // les veus Piper es baixen directament (i es desen a IndexedDB)
  const req = url.pathname === new URL("index.html", self.registration.scope).pathname ? "./" : e.request; // index.html es respon amb la còpia de "./"
  e.respondWith(caches.match(req, {{ cacheName: CACHE, ignoreSearch: true }}).then(r => r || fetch(e.request)));
}});
"""
open(os.path.join(OUT, "sw.js"), "w", encoding="utf-8").write(sw)
shutil.make_archive(os.path.join(ROOT, "dist", "LECAA-Tecla-PWA"), "zip", OUT)
print("PWA a", OUT, "· versió", ver)
