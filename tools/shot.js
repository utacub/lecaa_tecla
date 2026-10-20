// Ús: node shot.js <html> <hash> <sortida.png> [segons=3] [tecles separades per comes, amb pauses "wait:1.5"]
const { chromium } = require("/opt/node22/lib/node_modules/playwright");
(async () => {
  const [html, hash, out, secs = "3", keys = ""] = process.argv.slice(2);
  const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
  const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
  const errs = [];
  p.on("console", m => { if (m.type() === "error" || m.type() === "warning") errs.push(m.type() + ": " + m.text()); });
  p.on("pageerror", e => errs.push("pageerror: " + e.message));
  await p.goto("file://" + require("path").resolve(html) + "#" + hash);
  await p.waitForTimeout(800);
  for (const k of keys.split(",").filter(Boolean)) {
    if (k.startsWith("wait:")) { await p.waitForTimeout(parseFloat(k.slice(5)) * 1000); continue; }
    await p.keyboard.press(k === "space" ? "Space" : k); await p.waitForTimeout(120);
  }
  await p.waitForTimeout(parseFloat(secs) * 1000);
  await p.screenshot({ path: out });
  if (errs.length) console.log(errs.slice(0, 10).join("\n")); else console.log("cap error");
  await b.close();
})();
