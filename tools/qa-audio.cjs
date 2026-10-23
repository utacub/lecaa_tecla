// Render the actual music scheduler offline, check speech ducking and cancellation.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { pathToFileURL } = require('url');
function wav(samples, rate) {
  const out = Buffer.alloc(44 + samples.length * 2);
  out.write('RIFF'); out.writeUInt32LE(out.length - 8, 4); out.write('WAVEfmt ', 8);
  out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(rate, 24); out.writeUInt32LE(rate * 2, 28); out.writeUInt16LE(2, 32);
  out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  return out;
}
(async () => {
  const [html, output] = process.argv.slice(2); fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath: process.env.LECAA_CHROMIUM || undefined, headless: true,
    args: ['--no-sandbox', '--single-process', '--disable-gpu', '--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage(); const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve(html)).href + '#play=7&voice=0');
  await page.waitForFunction(() => window.LT);
  const lifecycle = await page.evaluate(async () => {
    Audio2.unlock(); await Audio2.ctx.resume(); Settings.music = true; Music.play('marimba');
    const first = Music.bus; Music.stop(); await new Promise(r => setTimeout(r, 220));
    const stopped = Music.timer === null && Music.bus === null && first.gain.value < 0.001;
    Music.refresh(); const restarted = !!Music.timer && Music.styleName === 'marimba';
    Audio2.duck('voice', true); Audio2.duck('phoneme', true); Audio2.duck('voice', false);
    await new Promise(r => setTimeout(r, 280)); const overlap = Audio2.musBus.gain.value < 0.08;
    Audio2.duck('phoneme', false); await new Promise(r => setTimeout(r, 800));
    const restored = Audio2.musBus.gain.value > 0.21;
    let spoken = 0; const original = TTS.engineFor;
    TTS.engineFor = () => ({ speak() { spoken++; return Promise.resolve(); } });
    const pending = TTS.say('prova'); TTS.stop(); await pending;
    TTS.engineFor = original;
    Voice.caption = 'anterior'; Voice.capT = 3; Voice.stop(); const captionCleared = Voice.capT === 0 && !Voice.caption;
    Settings.sfx = false; Settings.music = false; Settings.voice = false;
    App.setScene({ draw() {}, update() {} });
    Music.stop(); await Audio2.ctx.close(); Audio2.ctx = null;
    return { stopped, restarted, overlap, restored, cancelledBeforeStart: spoken === 0, voicesReleased: !Audio2.ducks.size, captionCleared };
  });
  const styles = [];
  for (const name of ['marimba', 'guitar', 'funk']) {
    const result = await page.evaluate(async name => {
      const rate = 44100, seconds = 16, c = new OfflineAudioContext(1, rate * seconds, rate);
      Audio2.ctx = c; Audio2.noiseBuf = null; Audio2.sfxBus = c.createGain(); Audio2.sfxBus.connect(c.destination);
      Audio2.musBus = c.createGain(); Audio2.musBus.gain.value = 0.22 * 0.9; Audio2.musBus.connect(c.destination);
      Music.bus = null; const s = Music.STYLES[name], step = 60 / s.bpm / 2;
      for (let i = 0; 0.1 + i * step < seconds - 1; i++) Music.sched(i, 0.1 + i * step, s, step);
      const rendered = await c.startRendering(), data = rendered.getChannelData(0);
      let peak = 0, energy = 0, invalid = 0;
      for (const v of data) { if (!Number.isFinite(v)) invalid++; peak = Math.max(peak, Math.abs(v)); energy += v * v; }
      return { name, peak, rms: Math.sqrt(energy / data.length), invalid, rate, samples: Array.from(data) };
    }, name);
    fs.writeFileSync(path.join(output, name + '.wav'), wav(result.samples, result.rate));
    delete result.samples; styles.push(result);
  }
  await browser.close();
  const report = { lifecycle, styles, errors, passed: Object.values(lifecycle).every(Boolean) && !errors.length
    && styles.every(s => s.peak > 0 && s.peak < 1 && s.rms > 0 && !s.invalid) };
  fs.writeFileSync(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report)); if (!report.passed) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
