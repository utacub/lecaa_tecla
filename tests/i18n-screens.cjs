// Captures de les pantalles principals en un o més idiomes i recull d'errors de consola.
// Ús: node tests/i18n-screens.cjs <html> <carpeta> [idiomes=ca,es,eu,gl,en,fr] [jocs=1-25] [nivells=1,3,6]
const path = require("path"), fs = require("fs");
let pw; try { pw = require("playwright"); } catch (e) { pw = require("/opt/node22/lib/node_modules/playwright"); }
(async () => {
  const [html, out, langsArg = "ca,es,eu,gl,en,fr", gamesArg = "1-25", lvlArg = "1,3,6"] = process.argv.slice(2);
  const range = a => a.split(",").flatMap(x => { const [p, q] = x.split("-").map(Number); return q ? Array.from({ length: q - p + 1 }, (_, i) => p + i) : [p]; });
  const langs = langsArg.split(","), games = gamesArg === "0" ? [] : range(gamesArg), lvls = range(lvlArg);
  fs.mkdirSync(out, { recursive: true });
  const b = await pw.chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const report = {};
  for (const lang of langs) {
    const screens = [["titol", ""], ["perfils", "scene=profiles"], ["illa", "scene=island"], ["viatge", "scene=voyage"], ["museu", "scene=museum"], ["docent", "scene=teacher"], ["bsn", "scene=bsn"]];
    for (const g of games) for (const l of lvls) screens.push([`g${String(g).padStart(2, "0")}-n${l}`, `play=${g}&lvl=${l}&auto=1&voice=0`]);
    for (const [name, hash] of screens) {
      const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
      const errs = [];
      p.on("crash", () => errs.push("crash"));
      p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
      p.on("pageerror", e => errs.push("pageerror: " + e.message));
      try {
        await p.goto("file://" + path.resolve(html) + "#" + [hash, "voice=0", "lang=" + lang].filter(Boolean).join("&"));
        await p.waitForTimeout(name.startsWith("g") ? 5000 : 2500);
        await p.screenshot({ path: path.join(out, `${lang}-${name}.png`) });
      } catch (e) { errs.push("test: " + e.message.split("\n")[0]); }
      if (errs.length) report[`${lang}-${name}`] = errs.slice(0, 5);
      await p.close().catch(() => { });
    }
  }
  await b.close();
  fs.writeFileSync(path.join(out, "errors.json"), JSON.stringify(report, null, 1));
  console.log(Object.keys(report).length ? JSON.stringify(report, null, 1) : "cap error");
})();
