#!/usr/bin/env python3
"""Munta LECAA Tecla en un sol fitxer HTML autònom (funciona amb file://)."""
import base64, glob, json, os, sys, shutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "dist", "index.html")
only = os.environ.get("ONLY")  # p. ex. ONLY=1,19 per muntar només uns jocs
def b64(p): return base64.b64encode(open(os.path.join(ROOT, "assets", p), "rb").read()).decode()
order = ["core", "textures", "art", "art-tanda3", "art-fruit", "art-tanda4", "art-tanda5", "art-final", "piper-worker", "audio", "tts", "content", "ui", "play", "avatars", "scenes", "voyage", "bsn", "credits"]
if os.path.exists(os.path.join(ROOT, "src", "critters.js")): order.insert(2, "critters")
parts = [open(os.path.join(ROOT, "src", f + ".js"), encoding="utf-8").read() for f in order]
games = sorted(glob.glob(os.path.join(ROOT, "src", "games", "g*.js")))
if only:
    keep = {f"g{int(x):02d}" for x in only.split(",")}
    games = [g for g in games if os.path.basename(g)[:3] in keep]
for g in games: parts.append(f"/* ---- {os.path.basename(g)} ---- */\n" + open(g, encoding="utf-8").read())
for f in ("shell", "native-scenery", "paper-island"):
    parts.append(open(os.path.join(ROOT, "src", f + ".js"), encoding="utf-8").read())
parts.append(open(os.path.join(ROOT, "src", "main.js"), encoding="utf-8").read())
logoP = open(os.path.join(ROOT, "assets", "LECAA-petroli-transparent.svg"), encoding="utf-8").read()
logoW = open(os.path.join(ROOT, "assets", "LECAA-blanc-transparent.svg"), encoding="utf-8").read()
# logo de la UTAC: assets/UTAC-logo.svg o .png si existeix (si no, el joc reserva el lloc)
utac = ""
for ext, mime in (("svg", "image/svg+xml"), ("png", "image/png")):
    if os.path.exists(os.path.join(ROOT, "assets", "UTAC-logo." + ext)): utac = f"data:{mime};base64," + b64("UTAC-logo." + ext); break
# altres logos dels crèdits: assets/credits/*.png|svg, en ordre alfabètic del nom de fitxer
credit_logos = []
for f in sorted(glob.glob(os.path.join(ROOT, "assets", "credits", "*"))):
    ext = f.rsplit(".", 1)[-1].lower(); mime = {"png": "image/png", "svg": "image/svg+xml", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}.get(ext)
    if mime: credit_logos.append(f"data:{mime};base64," + base64.b64encode(open(f, "rb").read()).decode())
# locucions dels fonemes (veu femenina de LECAA Docs): assets/sons/anna/*.mp3
phon = {os.path.splitext(os.path.basename(f))[0]: "data:audio/mpeg;base64," + base64.b64encode(open(f, "rb").read()).decode() for f in sorted(glob.glob(os.path.join(ROOT, "assets", "sons", "anna", "*.mp3")))}
js = f"const PHON_ANNA = {json.dumps(phon)};\n" + f"const CREDIT_LOGOS = {json.dumps(credit_logos)};\n" + f"const LOGO_UTAC = {json.dumps(utac)};\nconst LOGO_SVG_P = {json.dumps(logoP)};\nconst LOGO_SVG_W = {json.dumps(logoW)};\n" + "\n".join(parts)
# Només recursos optimitzats: les imatges font de references/ no entren a l'app.
# Un recurs buit no ha de produir una compilació aparentment correcta.
for asset_path in sorted(glob.glob(os.path.join(ROOT, "assets", "art", "*.webp"))):
    if os.path.getsize(asset_path) == 0:
        raise ValueError(f"Recurs artístic buit: {asset_path}")
art = {os.path.splitext(os.path.basename(f))[0]: "data:image/webp;base64," + base64.b64encode(open(f, "rb").read()).decode()
       for f in sorted(glob.glob(os.path.join(ROOT, "assets", "art", "*.webp")))}
js = f"const ART_DATA = {json.dumps(art)};\n" + js
js = js.replace("</script", "<\\/script")
# versió PWA (PWA=1): manifest, icones i service worker al costat de l'HTML
pwa = os.environ.get("PWA") == "1"
pwa_head = """
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#17676B">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="LECAA Tecla">
<link rel="apple-touch-icon" href="icones/icona-180.png">""" if pwa else ""
if pwa: js += "\nif ('serviceWorker' in navigator && location.protocol !== 'file:') addEventListener('load', () => navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {}));\n"
fav = "data:image/svg+xml," + "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='4' y='6' width='56' height='52' rx='14' fill='%2317676B'/%3E%3Crect x='4' y='4' width='56' height='50' rx='14' fill='%23fff' stroke='%2317676B' stroke-width='5'/%3E%3Ctext x='32' y='42' font-family='Arial' font-weight='900' font-size='32' text-anchor='middle' fill='%23203E42'%3ET%3C/text%3E%3C/svg%3E"
html = f"""<!doctype html>
<html lang="ca">
<head>
<!--
  LECAA Tecla · programari lliure, GPL-3.0 o posterior (https://github.com/utacub/lecaa_tecla).
  Inclou: tipografies Andika (SIL Global) i Nunito (The Nunito Project Authors), SIL Open Font License 1.1;
  ONNX Runtime Web (Microsoft), piper-wasm (Diffusion Studio) i piper-phonemize (Michael Hansen), MIT;
  el fonemitzador fa servir espeak-ng (GPL-3.0). Textos complets a la carpeta LICENSES del repositori.
-->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LECAA Tecla</title>
<link rel="icon" href="{fav}">{pwa_head}
<style>
@font-face {{ font-family: "Andika"; font-weight: 400; src: url(data:font/woff2;base64,{b64("Andika-400.woff2")}) format("woff2"); }}
@font-face {{ font-family: "Andika"; font-weight: 700; src: url(data:font/woff2;base64,{b64("Andika-700.woff2")}) format("woff2"); }}
@font-face {{ font-family: "Nunito"; font-weight: 200 1000; src: url(data:font/woff2;base64,{b64("Nunito-900.woff2")}) format("woff2"); }}
html, body {{ margin: 0; height: 100%; background: #203E42; overflow: hidden; }}
canvas {{ display: block; outline: none; }}
</style>
</head>
<body>
<canvas id="c" tabindex="0" aria-label="LECAA Tecla: joc per aprendre on són les lletres del teclat"></canvas>
<script>
{js}
</script>
</body>
</html>
"""
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf-8").write(html)
print(out, f"{len(html)/1024:.0f} KB", f"{len(games)} jocs")

