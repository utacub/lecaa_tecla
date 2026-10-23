// Ús: node tools/icons.js <carpeta sortida>  — dibuixa les icones de l'app (patró d'icona d'app de LECAA Docs: logo blanc + pastilla amb el nom)
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), out = process.argv[2];
const b64 = f => fs.readFileSync(path.join(ROOT, "assets", f)).toString("base64");
const logoW = fs.readFileSync(path.join(ROOT, "assets", "LECAA-blanc-transparent.svg"), "utf8");
const page = (size, maskable) => `<!doctype html><html><head><style>
@font-face { font-family: Nunito; font-weight: 900; src: url(data:font/woff2;base64,${b64("Nunito-900.woff2")}) format("woff2"); }
html,body{margin:0;width:${size}px;height:${size}px;background:transparent}
.ic{width:${size}px;height:${size}px;background:#17676B;border-radius:${maskable ? 0 : size * 0.22}px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${size * 0.05}px}
.lg{width:${size * (maskable ? 0.56 : 0.7)}px}.lg svg{width:100%;height:auto;display:block}
.k{display:flex;gap:${size * 0.018}px}
.k span{font:900 ${size * (maskable ? 0.085 : 0.105)}px Nunito;width:${size * (maskable ? 0.1 : 0.125)}px;height:${size * (maskable ? 0.11 : 0.135)}px;display:flex;align-items:center;justify-content:center;background:#fff;color:#203E42;border-radius:${size * 0.025}px;box-shadow:0 ${size * 0.012}px 0 #0E4B4E}
.k span.p{background:#203E42;color:#fff;transform:translateY(${size * 0.01}px);box-shadow:none}
</style></head><body><div class="ic"><div class="lg">${logoW}</div><div class="k"><span>T</span><span>E</span><span class="p">C</span><span>L</span><span>A</span></div></div></body></html>`;
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.LECAA_CHROMIUM || undefined });
  for (const [name, size, mask] of [["icona-192.png", 192, false], ["icona-512.png", 512, false], ["icona-maskable-512.png", 512, true], ["icona-180.png", 180, true]]) {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    await p.setContent(page(size, mask)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(out, name), omitBackground: true }); await p.close();
  }
  await b.close(); console.log("icones fetes a", out);
})();
