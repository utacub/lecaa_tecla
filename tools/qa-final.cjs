// NODE_PATH=<node_modules> LECAA_CHROMIUM=<optional binary> node tools/qa-batch5.cjs <html> <output-dir>
// Local checks only. Uses a fresh browser profile, never the user's learner data.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
(async () => {
  const [html, output = 'qa-art'] = process.argv.slice(2);
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.LECAA_CHROMIUM || undefined,
    headless: true, args: process.env.LECAA_CHROMIUM ? ['--no-sandbox', '--single-process', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader', '--disable-dev-shm-usage'] : [] });
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  const errors = [], report = { errors, functional: [], viewport: [] };
  page.on('pageerror', e => errors.push(e.stack || e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(pathToFileURL(path.resolve(html)).href + '#play=1&lvl=1&voice=0');
  await page.waitForFunction(() => window.LT && Art.get('g23_head'));
  await page.evaluate(() => { Settings.voice = false; Settings.music = false; Settings.sfx = false; Music.stop(); });
  for (const id of [24,25]) {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const result = await page.evaluate(async ({ id, level }) => {
        Math.random = mulberry32(703 + id * 31 + level);
        const s = new GameScene(Games.byId[id], level, Profiles.cur, { skipDemo: true, preview: true });
        App.setScene(s); s.startPlay();
        let steps = 0;
        for (; steps < 18000 && s.state !== 'end'; steps++) {
          s.update(1 / 30);
          if (steps % 3 === 0 && s.state === 'play') {
            if (s.halt) s.onKey(' ');
            else { const key = s.g.expected(); if (key) s.onKey(key); }
          }
          if (steps % 60 === 0) App.frame(0);
          // Farm doors and spoken prompts use real timers.
          // Yield so those callbacks run; a synchronous simulation would starve them.
          if (id === 21 && steps % 300 === 299) await new Promise(resolve => setTimeout(resolve, 500));
        }
        App.frame(0);
        return { id, level, state: s.state, success: s.result && s.result.success, hits: s.api.hits,
          misses: s.api.misses, simulatedSeconds: steps / 30 };
      }, { id, level });
      report.functional.push(result); console.log(JSON.stringify(result));
    }
    await page.evaluate(id => {
      const s = new GameScene(Games.byId[id], 1, Profiles.cur, { skipDemo: true, preview: true });
      App.setScene(s); s.startPlay(); for (let i = 0; i < 300; i++) { s.update(1 / 30); if (i < 240 && i % 6 === 0 && s.state === 'play') { const k = s.g.expected(); if (k) s.onKey(k); } } App.frame(0);
    }, id);
    await page.screenshot({ path: path.join(output, `game-${id}.png`) });
  }
  report.errorRecovery = await page.evaluate(() => {
    const s = new GameScene(Games.byId[1], 1, Profiles.cur, { skipDemo: true, preview: true });
    App.setScene(s); s.startPlay(); for (let i = 0; i < 180; i++) s.update(1 / 30);
    s.onKey('z'); const halted = s.halt; s.onKey(' '); s.update(0.3);
    s.onKey('Escape'); const paused = s.state === 'pause'; s.onKey('Enter');
    return { halted, resumedAfterError: !s.halt, paused, resumedAfterPause: s.state === 'play' };
  });
  for (const [width, height, reduce] of [[1366, 768, false], [1024, 768, true], [768, 1024, false]]) {
    await page.setViewportSize({ width, height });
    const state = await page.evaluate(reduce => { Settings.reduceMotion = reduce; App.resize(); App.frame(0);
      return { canvas: [App.canvas.width, App.canvas.height], scale: App.scale, art: Object.keys(Art.images).length }; }, reduce);
    report.viewport.push({ width, height, reduce, ...state });
    await page.screenshot({ path: path.join(output, `viewport-${width}x${height}.png`) });
  }
  // All 25 registered scenes still create, update and draw after the shared engine change.
  report.smoke = await page.evaluate(() => Object.keys(Games.byId).map(id => {
    try { const s = new GameScene(Games.byId[id], 1, Profiles.cur, { skipDemo: true, preview: true });
      App.setScene(s); s.startPlay(); for (let i = 0; i < 150; i++) s.update(1 / 30); App.frame(0); return { id: +id, ok: true }; }
    catch (e) { return { id: +id, ok: false, error: e.message }; }
  }));
  await browser.close();
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  const bad = errors.length || report.functional.some(x => !x.success) || report.smoke.some(x => !x.ok)
    || Object.values(report.errorRecovery).some(x => !x);
  console.log(JSON.stringify({ report: path.join(output, 'report.json'), errors, passed: !bad }));
  if (bad) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
