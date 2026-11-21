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
html_path = os.path.join(OUT, "index.html")
html = open(html_path, "rb").read()
# Mida exacta de l'HTML (el programa sencer: jocs, il·lustracions, sons de les lletres i tipografies hi són incrustats).
# build.py hi deixa PWA_BYTES = Number("0000000000"); se substitueix per un número de la mateixa amplada, així la mida no canvia.
size = len(html)
placeholder = b'const PWA_BYTES = Number("0000000000");'
assert html.count(placeholder) == 1, "falta el marcador PWA_BYTES a index.html"
html = html.replace(placeholder, f'const PWA_BYTES = Number("{size:010d}");'.encode())
assert len(html) == size
open(html_path, "wb").write(html)
ver = hashlib.sha256(html).hexdigest()[:10]
sw = f"""// Service worker de LECAA Tecla: tot el joc queda desat per funcionar sense connexió.
// La memòria cau (CacheStorage) és compartida per tot l'origen utacub.github.io: aquest service worker
// només crea, llegeix i esborra memòries que comencen per PREFIX i no toca les de les altres apps.
// Les veus neuronals opcionals (Piper) no passen per aquí: es baixen des dels ajustos de la veu i es desen a IndexedDB.
const PREFIX = "lecaa-tecla-";
const CACHE = PREFIX + "{ver}";
const APP_BYTES = {size}; // mida d'index.html sense comprimir
const FILES = {json.dumps(files)};
const HOME = new URL("./", self.registration.scope).href;
async function tell(message) {{
  for (const c of await self.clients.matchAll({{ type: "window", includeUncontrolled: true }})) c.postMessage(message);
}}
// "no-cache": el navegador revalida amb el servidor. Si la còpia de la memòria HTTP és la vigent (la que la pàgina
// acaba de carregar) no es torna a baixar; si és antiga (GitHub Pages permet 10 minuts de memòria), es baixa la nova.
const fresh = url => new Request(url, {{ cache: "no-cache" }});
// Baixa index.html comptant bytes perquè la portada pugui mostrar la barra de progrés.
async function storeApp(cache) {{
  const r = await fetch(fresh(HOME));
  if (!r.ok) throw new Error("HTTP " + r.status);
  const headers = {{ "Content-Type": r.headers.get("content-type") || "text/html; charset=utf-8" }};
  if (!r.body || typeof TransformStream !== "function") {{ await cache.put(HOME, new Response(await r.blob(), {{ headers }})); return; }}
  let done = 0, last = 0;
  const counter = new TransformStream({{
    transform(chunk, ctl) {{
      done += chunk.byteLength; ctl.enqueue(chunk);
      const now = Date.now();
      if (now - last > 200) {{ last = now; tell({{ type: "LECAA_TECLA_PROGRESS", done, total: Math.max(APP_BYTES, done) }}); }}
    }}
  }});
  // Si la connexió es talla, el flux falla, cache.put es rebutja i no queda res a mitges.
  await cache.put(HOME, new Response(r.body.pipeThrough(counter), {{ headers }}));
  // GitHub Pages comprimeix l'HTML; aquí arriba descomprimit, i ha de fer exactament la mida d'aquesta versió.
  if (done !== APP_BYTES) throw new Error("Descàrrega incompleta o d'una altra versió: " + done + " de " + APP_BYTES);
  await tell({{ type: "LECAA_TECLA_PROGRESS", done, total: done }});
}}
self.addEventListener("install", e => {{
  // Precàrrega atòmica: si algun fitxer no es pot desar, la instal·lació falla i no es fa servir una còpia incompleta.
  e.waitUntil((async () => {{
    const cache = await caches.open(CACHE);
    try {{
      await cache.addAll(FILES.filter(f => f !== "./").map(f => fresh(new URL(f, self.registration.scope).href)));
      await storeApp(cache);
    }} catch (err) {{ await caches.delete(CACHE); await tell({{ type: "LECAA_TECLA_FAILED" }}); throw err; }}
    // El joc sencer ja és a la memòria de la pàgina oberta: la versió nova pot entrar sense interrompre ningú.
    await self.skipWaiting();
  }})());
}});
self.addEventListener("activate", e => {{ e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); }});
// primer la còpia desada (funciona sense xarxa)
self.addEventListener("fetch", e => {{
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // les veus Piper es baixen directament (i es desen a IndexedDB)
  const req = url.pathname === new URL("index.html", self.registration.scope).pathname ? "./" : e.request; // index.html es respon amb la còpia de "./"
  e.respondWith(caches.match(req, {{ cacheName: CACHE, ignoreSearch: true }}).then(r => r || fetch(e.request)));
}});
// La pàgina pregunta si la còpia sense connexió és completa (tots els fitxers presents a la memòria d'aquesta versió).
self.addEventListener("message", e => {{
  if (!e.data || e.data.type !== "LECAA_TECLA_STATUS") return;
  e.waitUntil((async () => {{
    const cache = await caches.open(CACHE);
    const ok = (await Promise.all(FILES.map(f => cache.match(new URL(f, self.registration.scope).href)))).every(Boolean);
    if (e.ports[0]) e.ports[0].postMessage({{ type: ok ? "LECAA_TECLA_READY" : "LECAA_TECLA_MISSING", version: CACHE, bytes: APP_BYTES }});
  }})());
}});
"""
open(os.path.join(OUT, "sw.js"), "w", encoding="utf-8").write(sw)
shutil.make_archive(os.path.join(ROOT, "dist", "LECAA-Tecla-PWA"), "zip", OUT)
print("PWA a", OUT, "· versió", ver, "·", size, "bytes")
