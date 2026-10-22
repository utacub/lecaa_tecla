"use strict";
/* ============================================================
   Escenes de l'aplicació: portada, qui juga?, l'illa, museu,
   panell del docent.
   ============================================================ */
const ZONES = {
  poble:    { name: "El Poble", color: "#E8D6B0", label: [1230, 640] },
  camp:     { name: "El Camp", color: "#CFE08A", label: [560, 520] },
  costa:    { name: "La Costa", color: "#F1DDA6", label: [1330, 1360] },
  muntanya: { name: "La Muntanya", color: "#B9C4B4", label: [1640, 380] },
  espai:    { name: "L'Espai", color: "#2B2F5E", label: [900, 170] },
};
const PLACES = {
  1: [1150, 770], 25: [1360, 730], 17: [990, 860], 22: [1480, 880], 18: [1270, 930], 4: [1100, 1020],
  21: [420, 720], 9: [620, 640], 7: [520, 900], 19: [760, 790], 12: [380, 1050], 24: [700, 1040],
  10: [880, 1220], 8: [1120, 1290], 11: [1370, 1270], 6: [1600, 1180], 13: [1800, 1030],
  20: [930, 480], 16: [1170, 550], 15: [1420, 470], 5: [1660, 560], 14: [1860, 760],
  2: [1100, 250], 3: [1330, 200], 23: [1570, 270],
};
const START_OPEN = [1, 19, 10];
const WI = 2400, HI = 1500;

function islandR(a, k = 0) { // radi de l'illa segons l'angle (forma orgànica)
  return 1 + 0.06 * Math.sin(a * 3 + 1) + 0.04 * Math.sin(a * 5 + 2.3) + 0.03 * Math.sin(a * 9 + 0.4) + k;
}
const VOYAGE_POS = [210, 1360]; // racó d'aigua amb la barca del viatge
function islandPath(ctx, grow = 0, squashS = 0) {
  const cx = 1200, cy = 760, rx = 1090, ry = 650, N = 90;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const a = i / N * Math.PI * 2; let r = islandR(a);
    let sy = Math.sin(a); const yk = sy > 0 ? 1 - squashS * sy : 1;
    const x = cx + Math.cos(a) * (rx * r + grow), y = cy + sy * (ry * r * yk + grow);
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}
function unlockedSet(p) {
  if (Settings.allOpen !== false) return new Set(Games.list.map(g => g.id));
  const n = 3 + Math.floor(Profiles.totalStars(p) / 3), order = START_OPEN.concat(Games.sorted().map(g => g.id).filter(id => !START_OPEN.includes(id)));
  return new Set(order.slice(0, n));
}
/* veïns per a les fletxes */
function neighbour(from, dir) {
  const [x0, y0] = PLACES[from]; let best = null, bv = Infinity;
  const D = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[dir];
  for (const id in PLACES) {
    if (+id === from || !Games.byId[id]) continue; const [x, y] = PLACES[id], dx = x - x0, dy = y - y0, d = Math.hypot(dx, dy);
    const cos = (dx * D[0] + dy * D[1]) / d; if (cos < 0.5) continue;
    const v = d * (2 - cos); if (v < bv) { bv = v; best = +id; }
  }
  return best;
}

/* ---------- capa estàtica de l'illa (prerenderitzada) ---------- */
let ISLAND = null;
function buildIsland() {
  const S = 1.25, c = makeCanvas(WI * S, HI * S), x = c.getContext("2d"); x.scale(S, S);
  const R = mulberry32(2026);
  const grass = Tex.paper(512, 512, "#8DBF6A", { seed: 41, fiber: 1.4 }), sand = Tex.paper(512, 512, "#EED9A4", { seed: 43, fiber: 1.2 });
  // aigua poc fonda
  x.save(); islandPath(x, 70); x.fillStyle = "rgba(160,225,215,0.55)"; x.fill(); x.restore();
  x.save(); islandPath(x, 36); x.fillStyle = "rgba(190,240,228,0.6)"; x.fill(); x.restore();
  // sorra
  Mat.paperCut(x, ctx => islandPath(ctx, 6), "#EED9A4", { depth: 10 });
  Mat.texFill(x, ctx => islandPath(ctx, 6), sand, "#EED9A4", { mode: "multiply", alpha: 0.5 });
  // gespa (la platja del sud queda descoberta)
  Mat.paperCut(x, ctx => islandPath(ctx, -46, 0.28), "#8DBF6A", { depth: 8 });
  Mat.texFill(x, ctx => islandPath(ctx, -46, 0.28), grass, "#ffffff", { mode: "multiply", alpha: 0.55 });
  Mat.paperCut(x, ctx => islandPath(ctx, -120, 0.36), "#9BCB76", { depth: 5 });
  // L'Espai: un retall de cel nocturn al cim
  const espai = ctx => { ctx.beginPath(); ctx.ellipse(1320, 250, 470, 175, 0, 0, 6.28); };
  Mat.paperCut(x, espai, "#26295A", { depth: 10 });
  x.save(); espai(x); x.clip(); const sg = x.createRadialGradient(1320, 200, 40, 1320, 250, 480); sg.addColorStop(0, "#3C3F86"); sg.addColorStop(1, "#1B1D44"); x.fillStyle = sg; x.fillRect(800, 60, 1100, 400);
  x.drawImage(Tex.stars(940, 350, { seed: 77, n: 260, max: 2.6 }), 850, 75); x.restore();
  x.save(); x.fillStyle = "#F7F1D6"; x.beginPath(); x.arc(1720, 190, 34, 0, 6.28); x.fill(); x.fillStyle = "#26295A"; x.beginPath(); x.arc(1736, 180, 30, 0, 6.28); x.fill(); x.restore();
  // muntanyes (capes de paper, de lluny a prop)
  const mount = (bx, by, w, h, col, snow) => {
    const p = ctx => { ctx.beginPath(); ctx.moveTo(bx - w / 2, by); ctx.lineTo(bx - w * 0.12, by - h * 0.92); ctx.quadraticCurveTo(bx, by - h * 1.04, bx + w * 0.1, by - h * 0.9); ctx.lineTo(bx + w / 2, by); ctx.closePath(); };
    Mat.paperCut(x, p, col, { depth: 7 });
    x.save(); p(x); x.clip(); x.fillStyle = "rgba(0,0,0,0.12)"; x.beginPath(); x.moveTo(bx + w * 0.02, by - h); x.lineTo(bx + w / 2, by); x.lineTo(bx + w * 0.05, by); x.closePath(); x.fill(); x.restore();
    if (snow) { const sp = ctx => { ctx.beginPath(); ctx.moveTo(bx - w * 0.12 - w * 0.07, by - h * 0.72); ctx.lineTo(bx - w * 0.12, by - h * 0.92); ctx.quadraticCurveTo(bx, by - h * 1.04, bx + w * 0.1, by - h * 0.9); ctx.lineTo(bx + w * 0.17, by - h * 0.72); ctx.lineTo(bx + w * 0.08, by - h * 0.78); ctx.lineTo(bx, by - h * 0.7); ctx.lineTo(bx - w * 0.08, by - h * 0.78); ctx.closePath(); }; Mat.paperCut(x, sp, "#FBFBF6", { depth: 2 }); }
  };
  [[820, 470, 300, 210, "#93A39A", true], [1010, 440, 360, 260, "#A6B3A5", true], [1290, 470, 380, 230, "#8E9F96", true], [1520, 450, 340, 270, "#A2B0A2", true], [1760, 520, 380, 250, "#97A79B", true], [1980, 640, 300, 190, "#A9B6A3", false],
   [1090, 560, 260, 150, "#B3BFB0", false], [1400, 600, 300, 160, "#AAB8A8", false], [1780, 660, 260, 140, "#B4C0AF", false]].forEach(m => mount(...m));
  // el Camp: camps de conreu en mosaic
  const fields = [["#E7C964", -0.25], ["#B6D46E", -0.2], ["#C99F6B", -0.28], ["#E2D27A", -0.22], ["#9FC768", -0.18], ["#D9B35C", -0.24]];
  [[330, 640, 210, 150], [560, 560, 230, 130], [330, 840, 200, 160], [600, 760, 220, 150], [470, 1060, 220, 120], [760, 960, 180, 120]].forEach((f, i) => {
    const [fx, fy, fw, fh] = f, [col, rot] = fields[i];
    x.save(); x.translate(fx, fy); x.rotate(rot);
    const p = ctx => { rr(ctx, -fw / 2, -fh / 2, fw, fh, 14); };
    Mat.paperCut(x, p, col, { depth: 5 });
    x.save(); p(x); x.clip(); x.strokeStyle = "rgba(90,60,20,0.18)"; x.lineWidth = 3; for (let k = -fw; k < fw; k += 16) { x.beginPath(); x.moveTo(k, -fh); x.lineTo(k + 30, fh); x.stroke(); } x.restore();
    x.restore();
  });
  // el Poble: plaça empedrada amb font
  const plaza = ctx => { ctx.beginPath(); ctx.ellipse(1230, 860, 330, 230, 0, 0, 6.28); };
  Mat.paperCut(x, plaza, "#EBDDBE", { depth: 6 });
  x.save(); plaza(x); x.clip(); x.strokeStyle = "rgba(140,110,70,0.16)"; x.lineWidth = 2; for (let r = 40; r < 400; r += 34) { x.beginPath(); x.ellipse(1230, 860, r * 1.43, r, 0, 0, 6.28); x.stroke(); } x.restore();
  // estany (costa oest)
  const pond = ctx => { blobPath(ctx, 850, 1190, 120, 5, 0.12, 10); };
  Mat.paperCut(x, pond, "#4FA9B8", { depth: -4, shadow: "rgba(0,0,0,0.25)" });
  x.save(); pond(x); x.clip(); x.strokeStyle = "rgba(255,255,255,0.35)"; x.lineWidth = 3; for (let k = 0; k < 6; k++) { x.beginPath(); x.arc(850 + (R() - 0.5) * 120, 1190 + (R() - 0.5) * 80, 14 + R() * 18, 0, 6.28); x.stroke(); } x.restore();
  for (let k = 0; k < 4; k++) { const lx = 790 + R() * 120, ly = 1150 + R() * 80; x.fillStyle = "#5E9E4E"; x.beginPath(); x.arc(lx, ly, 14, 0.3, 6.0); x.lineTo(lx, ly); x.fill(); }
  // llac de l'est
  const lake = ctx => { blobPath(ctx, 2060, 900, 130, 9, 0.14, 10); };
  Mat.paperCut(x, lake, "#5BB3C2", { depth: -4 });
  // camins de punts entre llocs veïns
  const ids = Object.keys(PLACES).map(Number), edges = new Set();
  ids.forEach(a => { ids.map(b => [b, dist(...PLACES[a], ...PLACES[b])]).filter(q => q[0] !== a).sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([b]) => edges.add([Math.min(a, b), Math.max(a, b)].join("-"))); });
  x.save(); x.setLineDash([2, 16]); x.lineCap = "round"; x.lineWidth = 9; x.strokeStyle = "rgba(255,248,226,0.9)";
  edges.forEach(e => { const [a, b] = e.split("-").map(Number), [ax, ay] = PLACES[a], [bx, by] = PLACES[b]; x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo((ax + bx) / 2 + (ay - by) * 0.08, (ay + by) / 2 + (bx - ax) * 0.08, bx, by); x.stroke(); });
  x.restore();
  // arbres i cases (ordenats per y per tenir profunditat)
  const props = [];
  const far = (px, py, d) => ids.every(id => dist(px, py, ...PLACES[id]) > d);
  for (let k = 0; k < 420 && props.length < 120; k++) {
    const px = 150 + R() * 2100, py = 280 + R() * 1060, a = Math.atan2((py - 760) / 650, (px - 1200) / 1090), rn = Math.hypot((px - 1200) / 1090, (py - 760) / 650);
    if (rn > islandR(a) - 0.14 || py > 1180 && px > 950 && px < 1750) continue;
    if (!far(px, py, 120) || dist(px, py, 1320, 250) < 500 && py < 420 || dist(px, py, 1230, 860) < 320 || dist(px, py, 2060, 900) < 160 || dist(px, py, 850, 1190) < 150) continue;
    if (py < 640 && px > 700 && px < 2050) continue; // muntanya: pocs arbres
    props.push({ t: "tree", x: px, y: py, s: 0.7 + R() * 0.6, c: pick(["#4E8E4A", "#5E9D4F", "#3F7E48", "#6BAA55"]) });
  }
  [[1000, 700], [1080, 640], [1440, 650], [1520, 760], [1600, 900], [960, 990], [1400, 1060], [1240, 1080]].forEach(([hx, hy], i) => props.push({ t: "house", x: hx, y: hy, c: ["#E07A5F", "#F2CC8F", "#81B29A", "#E9A3B4", "#8FB6D9", "#F4A259", "#B79AD6", "#E07A5F"][i], roof: ["#A8432F", "#B5651D", "#3D6B57", "#A85A7A", "#3D5F8A", "#9E5A1E", "#6A4E99", "#7D3022"][i] }));
  [[1020, 1360], [1180, 1390], [1500, 1360], [1700, 1290], [960, 1320], [1880, 1180]].forEach(([px, py]) => props.push({ t: "palm", x: px, y: py }));
  props.push({ t: "fountain", x: 1230, y: 860 });
  props.push({ t: "dome", x: 1330, y: 330 }); props.push({ t: "rocket", x: 1490, y: 150 });
  props.sort((a, b) => a.y - b.y).forEach(p => drawProp(x, p, R));
  // rètols de zona
  for (const z in ZONES) { const Z = ZONES[z]; drawZoneBanner(x, Z.label[0], Z.label[1], Z.name, z === "espai"); }
  ISLAND = { c, S };
}
function drawProp(x, p, R) {
  if (p.t === "tree") {
    const s = p.s; x.save(); x.translate(p.x, p.y);
    x.fillStyle = "rgba(20,40,10,0.25)"; x.beginPath(); x.ellipse(8 * s, 4, 30 * s, 10 * s, 0, 0, 6.28); x.fill();
    x.fillStyle = "#8A5A3A"; x.fillRect(-4 * s, -26 * s, 8 * s, 28 * s);
    Mat.paperCut(x, ctx => { blobPath(ctx, 0, -50 * s, 34 * s, (p.x * 7 + p.y) | 0, 0.12, 8); }, p.c, { depth: 4 });
    x.fillStyle = "rgba(255,255,255,0.18)"; x.beginPath(); x.arc(-10 * s, -62 * s, 12 * s, 0, 6.28); x.fill();
    x.restore();
  } else if (p.t === "house") {
    x.save(); x.translate(p.x, p.y);
    x.fillStyle = "rgba(30,20,10,0.25)"; x.beginPath(); x.ellipse(10, 2, 50, 12, 0, 0, 6.28); x.fill();
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.rect(-36, -52, 72, 54); }, p.c, { depth: 4 });
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.moveTo(-46, -50); ctx.lineTo(0, -92); ctx.lineTo(46, -50); ctx.closePath(); }, p.roof, { depth: 4 });
    x.fillStyle = "#FFF4C8"; x.fillRect(-24, -40, 16, 16); x.fillRect(8, -40, 16, 16); x.fillStyle = shade(p.roof, -0.2); x.fillRect(-8, -24, 16, 26);
    x.restore();
  } else if (p.t === "palm") {
    x.save(); x.translate(p.x, p.y);
    x.fillStyle = "rgba(60,40,10,0.22)"; x.beginPath(); x.ellipse(20, 4, 44, 10, 0, 0, 6.28); x.fill();
    x.strokeStyle = "#9A6B3E"; x.lineWidth = 10; x.lineCap = "round"; x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(12, -40, 4, -86); x.stroke();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55; Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.moveTo(4, -86); ctx.quadraticCurveTo(4 + Math.cos(a - 0.3) * 40, -86 + Math.sin(a - 0.3) * 40, 4 + Math.cos(a) * 66, -80 + Math.sin(a) * 50 + 20); ctx.quadraticCurveTo(4 + Math.cos(a + 0.3) * 30, -86 + Math.sin(a + 0.3) * 30, 4, -86); }, k % 2 ? "#4F9A4A" : "#62AE55", { depth: 2 }); }
    x.restore();
  } else if (p.t === "fountain") {
    x.save(); x.translate(p.x, p.y);
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.ellipse(0, 0, 64, 34, 0, 0, 6.28); }, "#CFC2A6", { depth: 5 });
    x.fillStyle = "#6CC3D3"; x.beginPath(); x.ellipse(0, -2, 52, 26, 0, 0, 6.28); x.fill();
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.rect(-8, -46, 16, 42); }, "#D8CCB2", { depth: 3 });
    x.fillStyle = "rgba(255,255,255,0.7)"; x.beginPath(); x.ellipse(0, -48, 16, 7, 0, 0, 6.28); x.fill();
    x.restore();
  } else if (p.t === "dome") {
    x.save(); x.translate(p.x, p.y);
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.rect(-70, -40, 140, 46); }, "#E9E4D6", { depth: 5 });
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.arc(0, -40, 70, Math.PI, 0); ctx.closePath(); }, "#D7D2C4", { depth: 5 });
    x.fillStyle = "#2B2F5E"; x.fillRect(-12, -108, 24, 60);
    x.save(); x.translate(10, -88); x.rotate(-0.6); x.fillStyle = "#8A93A8"; x.fillRect(0, -10, 80, 20); x.restore();
    x.restore();
  } else if (p.t === "rocket") {
    x.save(); x.translate(p.x, p.y);
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.moveTo(0, -120); ctx.quadraticCurveTo(34, -80, 28, 0); ctx.lineTo(-28, 0); ctx.quadraticCurveTo(-34, -80, 0, -120); }, "#F4F1EA", { depth: 5 });
    Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.moveTo(0, -120); ctx.quadraticCurveTo(18, -104, 22, -88); ctx.lineTo(-22, -88); ctx.quadraticCurveTo(-18, -104, 0, -120); }, "#E0553A", { depth: 2 });
    for (const s of [-1, 1]) Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.moveTo(s * 26, -40); ctx.lineTo(s * 50, 6); ctx.lineTo(s * 26, 0); ctx.closePath(); }, "#E0553A", { depth: 2 });
    x.fillStyle = "#17676B"; x.beginPath(); x.arc(0, -60, 13, 0, 6.28); x.fill(); x.strokeStyle = "#fff"; x.lineWidth = 4; x.stroke();
    x.restore();
  }
}
function drawZoneBanner(x, bx, by, label, dark) {
  x.save(); x.font = `900 34px ${FONT_T}`; const w = x.measureText(label).width + 70, h = 58;
  Mat.paperCut(x, ctx => { ctx.beginPath(); ctx.moveTo(bx - w / 2 - 22, by - h / 2); ctx.lineTo(bx + w / 2 + 22, by - h / 2); ctx.lineTo(bx + w / 2 + 6, by); ctx.lineTo(bx + w / 2 + 22, by + h / 2); ctx.lineTo(bx - w / 2 - 22, by + h / 2); ctx.lineTo(bx - w / 2 - 6, by); ctx.closePath(); }, dark ? "#E3EFEB" : BRAND.petroli, { depth: 5 });
  x.fillStyle = dark ? BRAND.tinta : "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(label, bx, by + 2);
  x.restore();
}

/* ---------- Portada ---------- */
class TitleScene {
  constructor() { this.t = 0; this.escHeld = 0; this.credits = false; this.creditsT = 0; this.opts = false; this.optsT = 0; this.gulls = Array.from({ length: 5 }, (_, i) => ({ x: rand(0, W), y: rand(120, 300), s: rand(0.6, 1.1), v: rand(30, 60), p: rand(0, 6) })); }
  enter() { Music.play("menu"); this.said = false; }
  update(dt) {
    this.t += dt; this.creditsT = this.credits ? this.creditsT + dt : 0; this.optsT = this.opts ? this.optsT + dt : 0; this.gulls.forEach(g => { g.x += g.v * dt; if (g.x > W + 60) g.x = -60; });
    if (Input.held["Escape"]) { this.escHeld += dt; if (this.escHeld > 3) { this.escHeld = 0; Input.held["Escape"] = false; App.go(new CodeScene()); } } else this.escHeld = 0;
  }
  draw(ctx) {
    const t = this.t;
    // cel de capvespre
    const g = ctx.createLinearGradient(0, 0, 0, 560); g.addColorStop(0, "#2F5E7A"); g.addColorStop(0.45, "#E9A27C"); g.addColorStop(0.8, "#F6CF8E"); g.addColorStop(1, "#FBE3B0");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 560);
    const sunY = 470 + Math.sin(t * 0.1) * 4;
    const sg = ctx.createRadialGradient(1140, sunY, 20, 1140, sunY, 320); sg.addColorStop(0, "rgba(255,240,200,0.95)"); sg.addColorStop(0.2, "rgba(255,210,150,0.6)"); sg.addColorStop(1, "rgba(255,200,150,0)");
    ctx.fillStyle = sg; ctx.fillRect(700, 150, 900, 450);
    ctx.fillStyle = "#FFF1CF"; ctx.beginPath(); ctx.arc(1140, sunY, 72, 0, 6.28); ctx.fill();
    // núvols de paper
    const cloud = (cx, cy, s, col) => Sprites.draw(ctx, Sprites.get("cloud" + col, 300, 120, (x) => { Mat.paperCut(x, c2 => { c2.beginPath(); c2.arc(80, 80, 40, 0, 6.28); c2.arc(140, 60, 55, 0, 6.28); c2.arc(205, 78, 42, 0, 6.28); c2.rect(80, 70, 125, 50); }, col, { depth: 4, edge: false }); }), cx, cy, { s });
    cloud(260 + (t * 8) % 1900 - 200, 170, 1, "#FCE6CF"); cloud(900 + (t * 5) % 1900 - 400, 110, 0.7, "#F8DCC6"); cloud(1400 - (t * 6) % 1800 + 300, 230, 0.85, "#FBE9D6");
    // gavines
    ctx.strokeStyle = "#3B3B48"; ctx.lineWidth = 3; ctx.lineCap = "round";
    this.gulls.forEach(gl => { const f = Math.sin(t * 6 + gl.p) * 8 * gl.s; ctx.beginPath(); ctx.moveTo(gl.x - 18 * gl.s, gl.y - f); ctx.quadraticCurveTo(gl.x - 8 * gl.s, gl.y - 8 * gl.s, gl.x, gl.y); ctx.quadraticCurveTo(gl.x + 8 * gl.s, gl.y - 8 * gl.s, gl.x + 18 * gl.s, gl.y - f); ctx.stroke(); });
    // l'illa al lluny, en capes de paper
    const hill = (pts, col, key) => Sprites.draw(ctx, Sprites.get("thill" + key, W, 300, x => Mat.paperCut(x, c2 => { c2.beginPath(); c2.moveTo(pts[0][0], 300); pts.forEach(p => c2.lineTo(p[0], p[1])); c2.lineTo(pts[pts.length - 1][0], 300); c2.closePath(); }, col, { depth: 5 })), W / 2, 410, { ay: 0 });
    hill([[180, 300], [330, 200], [480, 150], [620, 60], [700, 40], [780, 90], [900, 130], [1040, 100], [1180, 170], [1300, 210], [1450, 300]], "#7E8FA0", "a");
    hill([[120, 300], [260, 230], [420, 200], [560, 160], [720, 190], [880, 170], [1020, 210], [1200, 230], [1380, 270], [1520, 300]], "#6E9A78", "b");
    // casetes i observatori diminuts
    ctx.fillStyle = "#F4F1EA"; ctx.beginPath(); ctx.arc(700, 448, 14, Math.PI, 0); ctx.fill(); ctx.fillRect(686, 448, 28, 8);
    ctx.fillStyle = "#E0553A"; [[540, 600], [600, 590], [930, 580], [980, 590]].forEach(([hx]) => { ctx.fillRect(hx, 588, 18, 14); });
    // mar
    const sea = ctx.createLinearGradient(0, 560, 0, H); sea.addColorStop(0, "#5F98A6"); sea.addColorStop(1, "#1F5A66"); ctx.fillStyle = sea; ctx.fillRect(0, 560, W, H - 560);
    ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = "#FFE6B8";
    for (let k = 0; k < 18; k++) { const yy = 575 + k * k * 1.3, w2 = 40 + k * 14; ctx.fillRect(1140 - w2 / 2 + Math.sin(t * 1.5 + k) * 12, yy, w2, 2 + k * 0.2); }
    ctx.restore();
    for (let r = 0; r < 6; r++) {
      const yy = 600 + r * 52, col = mix("#8EC3CB", "#2D6F7A", r / 6);
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
      for (let xx = 0; xx <= W; xx += 20) ctx.lineTo(xx, yy + Math.sin(xx * 0.012 + t * (0.8 + r * 0.15) + r) * (5 + r * 2));
      ctx.lineTo(W, H); ctx.closePath(); ctx.globalAlpha = 0.55; ctx.fill(); ctx.globalAlpha = 1;
    }
    // moll de fusta en primer pla
    const planks = Tex.wood(512, 128, "#9C6B43", { seed: 61 });
    ctx.save(); ctx.translate(0, 0);
    for (let k = 0; k < 7; k++) { const px = 120 + k * 40; ctx.fillStyle = "#5A3A22"; ctx.fillRect(px, 740, 18, 170); }
    ctx.save(); ctx.beginPath(); ctx.moveTo(0, 760); ctx.lineTo(560, 745); ctx.lineTo(600, 900); ctx.lineTo(0, 900); ctx.closePath(); ctx.clip();
    ctx.fillStyle = ctx.createPattern(planks, "repeat"); ctx.fillRect(0, 740, 620, 170);
    ctx.strokeStyle = "rgba(40,20,10,0.4)"; ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(0, 770 + k * 26); ctx.lineTo(620, 760 + k * 28); ctx.stroke(); }
    ctx.restore(); ctx.restore();
    // pals i rètol penjant amb el logo 4
    const bx = W / 2, by = 300, sw = Math.sin(t * 1.1) * 0.025 * (Settings.reduceMotion ? 0 : 1);
    ctx.fillStyle = "#6B4429"; ctx.fillRect(bx - 520, 60, 26, 760); ctx.fillRect(bx + 494, 60, 26, 760);
    ctx.fillStyle = "#7E5333"; ctx.fillRect(bx - 540, 54, 1080, 30);
    ctx.save(); ctx.translate(bx, 84); ctx.rotate(sw); ctx.translate(-bx, -84);
    ctx.strokeStyle = "#C9B28A"; ctx.lineWidth = 5; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(bx + s * 360, 84); ctx.lineTo(bx + s * 340, by - 110); ctx.stroke(); }
    drawPanel(ctx, bx - 430, by - 120, 860, 240, { r: 36, border: BRAND.petroli, blur: 40 });
    drawLogo(ctx, bx, by - 22, 124, { t, sway: !Settings.reduceMotion });
    text(ctx, "Juga i descobreix on viu cada lletra", bx, by + 74, { size: 28, weight: 700, color: BRAND.petroli });
    ctx.restore();
    // crida a començar
    const pa = 0.65 + 0.35 * Math.sin(t * 3);
    ctx.save(); ctx.globalAlpha = clamp(t - 0.6, 0, 1);
    // dues entrades: l'activitat Blanc sobre negre i l'illa dels jocs
    drawButton(ctx, W / 2 - 210, 686, "Blanc sobre negre", { fs: 34, h: 92, w: 390, style: "dark", click: () => this.start("bsn") });
    drawButton(ctx, W / 2 + 210, 686, "Anar a l'illa", { fs: 34, h: 92, w: 390, style: "primary", click: () => this.start("illa") });
    ctx.restore();
    // casella de pantalla completa (s'activa en clicar Començar, que és un gest de l'usuari)
    { const on = !!Settings.fullscreen, lw = measure(ctx, "Pantalla completa", 24, 800, FONT_T), bw = 44 + 14 + lw + 36, bx = W / 2 - bw / 2, by = 760;
      const ov = Mouse.add(bx, by, bw, 52, { click: () => { Settings.fullscreen = !Settings.fullscreen; saveSettings(); Sfx.play("tick"); } });
      ctx.save(); rr(ctx, bx, by, bw, 52, 26); ctx.fillStyle = ov ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.8)"; ctx.fill();
      rr(ctx, bx + 16, by + 12, 28, 28, 7); ctx.fillStyle = on ? BRAND.petroli : "#fff"; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.stroke();
      if (on) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.beginPath(); ctx.moveTo(bx + 23, by + 26); ctx.lineTo(bx + 28, by + 32); ctx.lineTo(bx + 38, by + 19); ctx.stroke(); }
      text(ctx, "Pantalla completa", bx + 58, by + 27, { size: 24, weight: 800, font: FONT_T, color: BRAND.tinta, align: "left" }); ctx.restore(); }
    // rodeta d'opcions (l'accés docent és a dins)
    drawGearButton(ctx, W - 50, 44, this, 0.78);
    if (this.escHeld > 0.2) { ctx.save(); ctx.fillStyle = "rgba(255,255,255,0.9)"; rr(ctx, W - 300, H - 70, 270, 40, 20); ctx.fill(); ctx.fillStyle = BRAND.petroli; rr(ctx, W - 296, H - 66, 262 * clamp(this.escHeld / 3, 0, 1), 32, 16); ctx.fill(); text(ctx, "Accés docent…", W - 165, H - 50, { size: 20, weight: 800, font: FONT_T, color: BRAND.tinta }); ctx.restore(); }
    // crèdits (a l'esquerra) i logos de les entitats (a baix a la dreta, sobre pastilla blanca)
    drawButton(ctx, 24, 37, "Crèdits", { fs: 20, h: 44, align: "left", click: () => { this.credits = true; Sfx.play("whoosh"); } });
    { const lh = 54, uw = drawUTACMeasure(lh); ctx.save(); drawPanel(ctx, W - uw - 76, H - 96, uw + 56, 74, { r: 37, border: false, blur: 14 }); drawUTAC(ctx, W - uw - 48, H - 59, lh); ctx.restore(); } // només la UTAC; la resta, a Crèdits
    drawGrainOverlay(ctx, 0.07);
    drawVignette(ctx, 0.25);
    if (this.opts) drawIslandOptions(ctx, this);
    if (this.credits) drawCredits(ctx, this);
  }
  onKey(k) {
    if (this.credits) { if (k === "Escape" || k === "Enter" || k === " ") this.credits = false; return; }
    if (this.opts && k === "Escape") this.opts = false;
  }
  start(which) {
    if (Settings.fullscreen && !document.fullscreenElement) { try { const el = document.documentElement, r = el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen && el.webkitRequestFullscreen(); if (r && r.catch) r.catch(() => { }); } catch (e) { } }
    Sfx.play("whoosh");
    if (which === "bsn") App.go(new BlackWhiteScene(), { from: [W / 2 - 210, 686], to: [W / 2, H / 2] });
    else App.go(new ProfileScene(), { from: [W / 2 + 210, 686], to: [W / 2, H / 2] });
  }
}

/* ---------- Qui juga? ---------- */
class ProfileScene {
  constructor() { this.t = 0; this.sel = 0; this.mode = "pick"; this.newP = { name: "", animal: 0, color: 0, field: 0 }; this.jump = null; }
  enter() { Music.play("menu"); if (!Profiles.list.length) this.mode = "new"; }
  slots() { const s = Profiles.list.slice(); if (s.length < 30) s.push(null); return s; }
  update(dt) { this.t += dt; if (this.jump) { this.jump.t += dt; if (this.jump.t > 0.9) { const p = this.jump.p; this.jump = null; Profiles.cur = p; Store.set("lastProfile", p.id); App.go(!p.calib || p.redoCalib ? new VoyageScene(p) : new IslandScene(p, { intro: true })); } } }
  draw(ctx) {
    const t = this.t;
    // paret de paper amb sòcol petroli i un moble de fusta amb prestatges
    ctx.fillStyle = ctx.createPattern(Tex.paper(512, 512, "#EFE8D8", { seed: 71, fiber: 1.2 }), "repeat"); ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = BRAND.petroli; ctx.lineWidth = 2; for (let xx = 0; xx < W; xx += 46) { ctx.beginPath(); ctx.moveTo(xx, 0); ctx.lineTo(xx, H); ctx.stroke(); } ctx.restore();
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(0, 700, W, 124); ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(0, 700, W, 6);
    text(ctx, "Qui juga?", W / 2, 66, { size: 56, weight: 900, font: FONT_T, color: BRAND.tinta });
    const S = this.slots(), cols = 6, cw = 200, chh = 190, x0 = W / 2 - cols * cw / 2, y0 = 136;
    const rows = Math.max(2, Math.ceil(S.length / cols)), visRows = 3, srow = Math.floor(this.sel / cols);
    this.scroll = clamp(this.scroll || 0, Math.max(0, srow - visRows + 1), srow); const scroll = this.scroll;
    const wood = Tex.wood(512, 128, "#A8754A", { seed: 81 }), woodD = Tex.wood(128, 512, "#8E5F3A", { seed: 83, vertical: true });
    const cabH = visRows * chh + 40;
    ctx.save(); ctx.shadowColor = "rgba(40,20,5,0.45)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    ctx.fillStyle = ctx.createPattern(woodD, "repeat"); ctx.fillRect(x0 - 70, y0 - 30, cols * cw + 140, cabH + 40); ctx.restore();
    ctx.fillStyle = "#5C3B22"; ctx.fillRect(x0 - 40, y0 - 4, cols * cw + 80, cabH - 4);
    const bg = ctx.createLinearGradient(0, y0, 0, y0 + cabH); bg.addColorStop(0, "#6E4A2E"); bg.addColorStop(1, "#4E321D"); ctx.fillStyle = bg; ctx.fillRect(x0 - 40, y0 - 4, cols * cw + 80, cabH - 4);
    for (let r = 0; r < visRows; r++) {
      const sy = y0 + r * chh + 150;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.45)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 8; ctx.fillStyle = ctx.createPattern(wood, "repeat"); ctx.fillRect(x0 - 40, sy, cols * cw + 80, 26); ctx.restore();
      ctx.fillStyle = "rgba(255,230,190,0.25)"; ctx.fillRect(x0 - 40, sy, cols * cw + 80, 3);
    }
    if (rows > visRows) text(ctx, (scroll + visRows < rows ? "↓ " : "") + (scroll > 0 ? "↑" : ""), x0 + cols * cw + 52, y0 + cabH - 40, { size: 30, weight: 900, font: FONT_T, color: "#FFE9C8" });
    S.forEach((p, i) => {
      const r = Math.floor(i / cols) - scroll, c = i % cols; if (r < 0 || r >= visRows) return;
      const cx = x0 + c * cw + cw / 2, cy = y0 + r * chh + 74;
      if (this.mode === "pick") Mouse.add(cx - cw / 2 + 6, cy - 80, cw - 12, 206, { hover: () => { if (this.sel !== i) { this.sel = i; Sfx.play("tick"); } }, click: () => { this.sel = i; this.onKey("Enter"); } });
      const sel = i === this.sel && this.mode === "pick";
      if (sel) { const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, 130); g.addColorStop(0, "rgba(255,248,210,0.95)"); g.addColorStop(1, "rgba(255,248,210,0)"); ctx.fillStyle = g; ctx.fillRect(cx - 140, cy - 140, 280, 280); }
      if (p) {
        let jy = 0, js = 1;
        if (this.jump && this.jump.p === p) { const k = this.jump.t / 0.9; jy = -Math.sin(k * Math.PI) * 120; js = 1 + k * 0.6; }
        drawAvatar(ctx, cx, cy + jy + (sel ? Math.sin(t * 5) * 4 : 0), 130 * js, ANIMALS[p.animal % 8] ? ANIMALS[p.animal % 8].id : p.animal, PLUSH[p.color % 8], { body: false, tilt: sel ? Math.sin(t * 3) * 0.06 : 0 });
        // placa amb el nom
        ctx.save(); ctx.font = `800 24px ${FONT_T}`; const nw = Math.max(110, ctx.measureText(p.name).width + 30);
        rr(ctx, cx - nw / 2, cy + 80, nw, 40, 10); ctx.fillStyle = sel ? BRAND.petroli : "#FFFDF6"; ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 6; ctx.shadowOffsetY = 3; ctx.fill(); ctx.restore();
        text(ctx, p.name, cx, cy + 101, { size: 24, weight: 800, font: FONT_T, color: sel ? "#fff" : BRAND.tinta });
      } else {
        ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.strokeStyle = sel ? "#FFE9C8" : "rgba(255,233,200,0.45)"; ctx.beginPath(); ctx.arc(cx, cy + 4, 58, 0, 6.28); ctx.stroke(); ctx.restore();
        text(ctx, "+", cx, cy, { size: 70, weight: 900, font: FONT_T, color: sel ? "#FFE9C8" : "rgba(255,233,200,0.55)" });
        ctx.save(); rr(ctx, cx - 55, cy + 80, 110, 40, 10); ctx.fillStyle = sel ? BRAND.petroli : "#FFFDF6"; ctx.fill(); ctx.restore();
        text(ctx, "Nou", cx, cy + 101, { size: 24, weight: 800, font: FONT_T, color: sel ? "#fff" : BRAND.tinta });
      }
    });
    // barra inferior (sense instruccions escrites)
    ctx.save(); ctx.fillStyle = "rgba(32,62,66,0.92)"; ctx.fillRect(0, H - 76, W, 76);
    drawButton(ctx, 40, H - 38, "Portada", { align: "left", fs: 22, h: 46, style: "ghost", click: this.mode === "pick" ? () => this.onKey("Escape") : null });
    drawLogo(ctx, W - 210, H - 38, 40, { variant: "dark" });
    ctx.restore();
    if (this.mode === "new") this.drawNew(ctx);
    drawGrainOverlay(ctx, 0.05);
  }
  drawNew(ctx) {
    const n = this.newP, t = this.t;
    ctx.save(); ctx.fillStyle = "rgba(20,38,42,0.55)"; ctx.fillRect(0, 0, W, H);
    const pw = 980, ph = 640, px = W / 2 - pw / 2, py = 120;
    Mouse.add(0, 0, W, H, {}); // bloqueja els clics de sota
    drawPanel(ctx, px, py, pw, ph, { r: 36 });
    text(ctx, "Nou jugador", W / 2, py + 60, { size: 46, weight: 900, font: FONT_T, color: BRAND.tinta });
    const an = ANIMALS[n.animal];
    drawAvatar(ctx, px + 230, py + 300, 260, an.id, PLUSH[n.color], { tilt: Math.sin(t * 2) * 0.05 });
    text(ctx, an.name, px + 230, py + 470, { size: 30, weight: 800, font: FONT_T, color: BRAND.petroli });
    // fletxes per canviar d'animal amb el ratolí
    for (const [sd, key] of [[-1, "ArrowLeft"], [1, "ArrowRight"]]) {
      const ax = px + 230 + sd * 170, ay = py + 300, ov = Mouse.add(ax - 32, ay - 32, 64, 64, { click: () => { this.onKey(key); Sfx.play("tick"); } });
      ctx.beginPath(); ctx.arc(ax, ay, 30, 0, 6.28); ctx.fillStyle = ov ? BRAND.petroli : BRAND.menta; ctx.fill();
      text(ctx, sd < 0 ? "‹" : "›", ax, ay - 3, { size: 48, weight: 900, font: FONT_T, color: ov ? "#fff" : BRAND.tinta });
    }
    PLUSH.forEach((c, i) => { Mouse.add(px + 494 + (i % 4) * 56 - 26, py + 200 + Math.floor(i / 4) * 56 - 26, 52, 52, { click: () => { n.color = i; Sfx.play("tick"); } }); ctx.beginPath(); ctx.arc(px + 494 + (i % 4) * 56, py + 200 + Math.floor(i / 4) * 56, 22, 0, 6.28); ctx.fillStyle = c; ctx.fill(); if (i === n.color) { ctx.lineWidth = 5; ctx.strokeStyle = BRAND.tinta; ctx.stroke(); } });
    text(ctx, "Nom", px + 470, py + 330, { size: 28, weight: 800, font: FONT_T, color: BRAND.tinta, align: "left" });
    rr(ctx, px + 470, py + 360, 440, 96, 18); ctx.fillStyle = BRAND.crema; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = BRAND.petroli; ctx.stroke();
    const nm = n.name || ""; text(ctx, nm, px + 494, py + 410, { size: 56, weight: 700, align: "left", color: BRAND.ink });
    const cw = measure(ctx, nm, 56); if (Math.sin(t * 6) > 0) { ctx.fillStyle = BRAND.petroli; ctx.fillRect(px + 498 + cw, py + 380, 4, 58); }
    drawButton(ctx, px + 470, py + 530, "Fet", { align: "left", fs: 28, w: 200, style: "primary", click: () => this.onKey("Enter") });
    if (Profiles.list.length) drawButton(ctx, px + 690, py + 530, "Enrere", { align: "left", fs: 28, w: 200, style: "light", click: () => this.onKey("Escape") });
    ctx.restore();
  }
  onWheel(d) { if (this.mode === "pick" && !this.jump) this.onKey(d > 0 ? "ArrowDown" : "ArrowUp"); }
  onKey(k) {
    if (this.jump) return;
    if (this.mode === "new") {
      const n = this.newP;
      if (k === "ArrowLeft") n.animal = (n.animal + 7) % 8; else if (k === "ArrowRight") n.animal = (n.animal + 1) % 8;
      else if (k === "ArrowUp") n.color = (n.color + 7) % 8; else if (k === "ArrowDown") n.color = (n.color + 1) % 8;
      else if (k === "Backspace") n.name = n.name.slice(0, -1);
      else if (k === "Escape" && Profiles.list.length) this.mode = "pick";
      else if (k === "Enter" && n.name.trim()) { const nm = n.name.trim(); const p = Profiles.add(nm.charAt(0).toLocaleUpperCase("ca") + nm.slice(1), n.animal, n.color); this.mode = "pick"; this.sel = Profiles.list.indexOf(p); Sfx.play("win"); this.jump = { p, t: 0 }; Voice.say("Hola, " + p.name + "!"); }
      else if (k.length === 1 && n.name.length < 14 && /[\p{L} ·'-]/u.test(k)) { n.name += k; Sfx.play("key"); }
      return;
    }
    const S = this.slots(), cols = 6;
    if (k === "ArrowLeft") this.sel = (this.sel + S.length - 1) % S.length;
    else if (k === "ArrowRight") this.sel = (this.sel + 1) % S.length;
    else if (k === "ArrowUp") this.sel = Math.max(0, this.sel - cols);
    else if (k === "ArrowDown") this.sel = Math.min(S.length - 1, this.sel + cols);
    else if (k === "Enter") { const p = S[this.sel]; if (p) { Sfx.play("boing"); this.jump = { p, t: 0 }; } else { this.mode = "new"; this.newP = { name: "", animal: randi(0, 7), color: randi(0, 7) }; Voice.say("Com et dius?"); } return; }
    else if (k === "Escape") { App.go(new TitleScene()); return; }
    else if (k.length === 1) { const i = S.findIndex((p, j) => p && p.name.toLocaleLowerCase("ca").startsWith(k)); if (i >= 0) this.sel = i; else return; }
    else return;
    Sfx.play("tick");
  }
}

/* ---------- L'illa ---------- */
class IslandScene {
  constructor(profile, o = {}) {
    this.p = profile; this.o = o; this.t = 0;
    if (!ISLAND) buildIsland();
    const lastPlace = o.focus || Store.get("lastPlace", 1);
    this.at = Games.byId[lastPlace] ? lastPlace : 1; this.pos = PLACES[this.at].slice(); this.walk = null;
    this.cam = { x: this.pos[0], y: this.pos[1], z: o.intro ? 0.62 : 1.12 };
    // zoom triat amb la rodeta i càmera lliure quan s'arrossega el mapa
    this.zoomT = Store.get("islandZoom", 1.12); this.free = null;
    this.introT = o.intro ? 0 : 99; this.cardT = 0; this.cardOpen = false; this.credits = false; this.creditsT = 0; this.opts = false; this.optsT = 0; // en entrar, cap joc seleccionat
    this.open = unlockedSet(profile);
    this.levels = Store.get("levels." + (profile ? profile.id : "x"), {});
    this.clouds = Array.from({ length: 7 }, (_, i) => ({ x: rand(0, WI), y: rand(100, HI - 100), s: rand(0.7, 1.3), v: rand(8, 18) }));
  }
  enter() { Music.play("menu"); }
  level() { return this.levels[this.at] || tuneOf(this.p).level; }
  sayPlace() { } // sense veu en triar un lloc (Marc, 20-10-2026)
  goTo(id) {
    if (!Games.byId[id] || id === this.at && !this.walk) return;
    this.walk = { from: this.pos.slice(), to: PLACES[id], id, t: 0, d: dist(...this.pos, ...PLACES[id]) };
    this.at = id; this.cardT = -10; this.cardOpen = true; this.free = null; Sfx.play("whoosh"); Store.set("lastPlace", id);
  }
  camClamp(x, y, z) {
    const vw = W / z, vh = H / z, m = 160;
    return [vw > WI + 2 * m ? WI / 2 : clamp(x, vw / 2 - m, WI - vw / 2 + m), vh > HI + 2 * m ? HI / 2 : clamp(y, vh / 2 - m, HI - vh / 2 + m)];
  }
  screenToWorld(x, y) { return [(x - W / 2) / this.cam.z + this.cam.x, (y - H / 2) / this.cam.z + this.cam.y]; }
  onDrag(dx, dy) {
    if (this.credits || this.opts) return;
    if (this.introT < 1.4) this.introT = 1.4;
    const [x, y] = this.camClamp(this.cam.x - dx / this.cam.z, this.cam.y - dy / this.cam.z, this.cam.z);
    this.cam.x = x; this.cam.y = y; this.free = [x, y];
  }
  onWheel(d, mx, my) {
    if (this.credits || this.opts) return;
    if (this.introT < 1.4) this.introT = 1.4;
    const z0 = this.cam.z, z1 = clamp(z0 * (d < 0 ? 1.15 : 1 / 1.15), 0.6, 2);
    const [wx, wy] = this.screenToWorld(mx, my);
    // el punt de sota el ratolí es queda quiet mentre s'apropa o s'allunya
    const [x, y] = this.camClamp(wx - (mx - W / 2) / z1, wy - (my - H / 2) / z1, z1);
    this.cam.z = this.zoomT = z1; this.cam.x = x; this.cam.y = y; this.free = [x, y];
    Store.set("islandZoom", z1);
  }
  update(dt) {
    this.t += dt; this.introT += dt; this.creditsT = this.credits ? this.creditsT + dt : 0; this.optsT = this.opts ? this.optsT + dt : 0;
    this.clouds.forEach(c => { c.x += c.v * dt; if (c.x > WI + 200) c.x = -200; });
    if (this.walk) {
      const w = this.walk; w.t += dt * 900 / Math.max(200, w.d);
      const k = Ease.inOutQuad(clamp(w.t, 0, 1)); this.pos = [lerp(w.from[0], w.to[0], k), lerp(w.from[1], w.to[1], k)];
      if (w.t >= 1) { this.walk = null; this.cardT = 0; Sfx.play("plof"); this.sayPlace(); }
    } else this.cardT += dt;
    const tz = this.introT < 1.4 ? 0.62 : this.zoomT;
    const ease = 1 - Math.pow(0.02, dt);
    this.cam.z = lerp(this.cam.z, tz, this.introT < 1.4 ? 0 : ease * 0.6);
    const [tx, ty] = this.free ? this.camClamp(this.free[0], this.free[1], this.cam.z) : this.camClamp(this.pos[0] + (this.cardOpen && this.cardT > -1 ? 180 / this.cam.z : 0), this.pos[1], this.cam.z);
    this.cam.x = lerp(this.cam.x, this.introT < 1.4 ? WI / 2 : tx, this.introT < 1.4 ? 1 : ease);
    this.cam.y = lerp(this.cam.y, this.introT < 1.4 ? HI / 2 + 20 : ty, this.introT < 1.4 ? 1 : ease);
  }
  worldToScreen(x, y) { return [(x - this.cam.x) * this.cam.z + W / 2, (y - this.cam.y) * this.cam.z + H / 2]; }
  draw(ctx) {
    const t = this.t, z = this.cam.z;
    // mar
    ctx.fillStyle = "#2F8C99"; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-this.cam.x, -this.cam.y);
    const sea = Tex.paper(512, 512, "#3D9AA6", { seed: 91, fiber: 0.8 });
    ctx.save(); ctx.fillStyle = ctx.createPattern(sea, "repeat"); ctx.globalAlpha = 0.9; ctx.fillRect(-1200, -1200, WI + 2400, HI + 2400); ctx.restore();
    ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 4; ctx.lineCap = "round";
    for (let k = 0; k < 40; k++) { const wx = ((k * 397) % (WI + 800)) - 400 + Math.sin(t * 0.4 + k) * 20, wy = ((k * 211) % (HI + 600)) - 300; ctx.beginPath(); ctx.arc(wx, wy, 26, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    ctx.restore();
    // espuma al voltant de l'illa
    ctx.save(); ctx.setLineDash([26, 18]); ctx.lineDashOffset = -t * 20; ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 6; islandPath(ctx, 52 + Math.sin(t * 1.2) * 6); ctx.stroke(); ctx.restore();
    ctx.drawImage(ISLAND.c, 0, 0, WI, HI);
    // llocs i cartells
    this.hoverId = null; this.hoverVoy = false;
    const ids = Object.keys(PLACES).map(Number).filter(id => Games.byId[id]).sort((a, b) => PLACES[a][1] - PLACES[b][1]);
    ids.forEach(id => this.drawPlace(ctx, id));
    this.drawVoyageToken(ctx);
    // avatar
    if (this.p) {
      const [ax, ay] = this.pos, walking = !!this.walk;
      drawAvatar(ctx, ax - 30, ay + 70, 92, ANIMALS[this.p.animal].id, PLUSH[this.p.color], { body: true, walk: walking ? t : 0, tilt: walking ? Math.sin(t * 14) * 0.08 : Math.sin(t * 2) * 0.03 });
    }
    // núvols en primer pla (parallax) amb la seva ombra
    this.clouds.forEach(c => {
      const px = c.x + (this.cam.x - WI / 2) * 0.25, py = c.y + (this.cam.y - HI / 2) * 0.25;
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = "#103038"; ctx.beginPath(); ctx.ellipse(px + 60, py + 120, 130 * c.s, 40 * c.s, 0, 0, 6.28); ctx.fill(); ctx.restore();
      Sprites.draw(ctx, Sprites.get("icloud", 300, 130, (x) => { Mat.paperCut(x, c2 => { c2.beginPath(); c2.arc(80, 80, 40, 0, 6.28); c2.arc(140, 58, 55, 0, 6.28); c2.arc(205, 78, 42, 0, 6.28); c2.rect(80, 70, 125, 50); }, "#FFFFFF", { depth: 5, edge: false }); }), px, py, { s: c.s * 0.8, alpha: 0.5 });
    });
    ctx.restore();
    // llum segons l'hora del dia
    const hr = new Date().getHours() + new Date().getMinutes() / 60;
    const tint = hr < 8 ? ["rgba(255,190,140,", 0.12] : hr < 17 ? null : hr < 20 ? ["rgba(255,150,90,", 0.14] : ["rgba(40,50,120,", 0.22];
    if (tint) { ctx.fillStyle = tint[0] + tint[1] + ")"; ctx.fillRect(0, 0, W, H); }
    drawVignette(ctx, 0.3, "10,40,50");
    // nom del joc en passar-hi el ratolí
    if (this.hoverVoy && !this.hoverId) { const [hx, hy] = this.worldToScreen(VOYAGE_POS[0], VOYAGE_POS[1] - 150); drawChip(ctx, hx, hy - 40, "El viatge a l'illa", { align: "center", fs: 24, h: 46, fill: "rgba(23,103,107,0.95)" }); }
    if (this.hoverId && !this.walk) { const g = Games.byId[this.hoverId], [hx, hy] = this.worldToScreen(PLACES[this.hoverId][0], PLACES[this.hoverId][1] - 66); drawChip(ctx, hx, hy - 58, g.name, { align: "center", fs: 24, h: 46, fill: "rgba(23,103,107,0.95)" }); }
    this.drawHUD(ctx);
    if (this.cardOpen && this.cardT > 0 && !this.walk) { if (this.cardVoy) this.drawVoyageCard(ctx); else this.drawCard(ctx); }
    if (this.opts) drawIslandOptions(ctx, this);
    if (this.credits) drawCredits(ctx, this);
  }
  drawPlace(ctx, id) {
    const [x, y] = PLACES[id], g = Games.byId[id], sel = id === this.at && this.cardOpen, open = this.open.has(id), t = this.t;
    const r = 66, bob = sel && !this.walk ? Math.sin(t * 3) * 3 : 0;
    // zona clicable (en coordenades de pantalla): el medalló i el cartell
    const [s0x, s0y] = this.worldToScreen(x - r - 10, y - r - 10), [s1x, s1y] = this.worldToScreen(x + r + 10, y + r + 34);
    const hov = this.introT >= 1.4 && Mouse.add(s0x, s0y, s1x - s0x, s1y - s0y, { click: () => this.clickPlace(id) });
    // peanya de paper
    ctx.save(); ctx.shadowColor = "rgba(20,30,20,0.35)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 8; ctx.fillStyle = "#FFFDF6"; ctx.beginPath(); ctx.arc(x, y - bob, r + 8, 0, 6.28); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y - bob, r, 0, 6.28); ctx.clip();
    const sp = Sprites.get("thumbI" + id, 2 * r, 2 * r, (cx) => { try { g.thumb(cx, 0, 0, 2 * r, 2 * r, 0); } catch (e) { cx.fillStyle = "#ccc"; cx.fillRect(0, 0, 2 * r, 2 * r); } });
    if (sel && open) { try { g.thumb(ctx, x - r, y - r - bob, 2 * r, 2 * r, t); } catch (e) { } } else ctx.drawImage(sp.c, x - r, y - r - bob, 2 * r, 2 * r);
    if (!open) { // boira de paper
      ctx.fillStyle = "rgba(236,236,230,0.92)"; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
      ctx.fillStyle = "rgba(255,255,255,0.8)"; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.arc(x - 40 + k * 20, y + Math.sin(k * 2 + t) * 8, 26, 0, 6.28); ctx.fill(); }
      ctx.fillStyle = "#8A9696"; rr(ctx, x - 18, y - 6, 36, 30, 6); ctx.fill(); ctx.strokeStyle = "#8A9696"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y - 6, 12, Math.PI, 0); ctx.stroke();
    }
    ctx.restore();
    ctx.save(); ctx.lineWidth = sel ? 8 : 5; ctx.strokeStyle = sel ? BRAND.petroli : "rgba(32,62,66,0.55)"; ctx.beginPath(); ctx.arc(x, y - bob, r + 3, 0, 6.28); ctx.stroke(); ctx.restore();
    if (hov && !sel) { ctx.save(); ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, r + 14, 0, 6.28); ctx.stroke(); ctx.restore(); }
    if (sel) { ctx.save(); ctx.strokeStyle = rgba("#FFF6C8", 0.6 + 0.3 * Math.sin(t * 4)); ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.lineDashOffset = t * 30; ctx.beginPath(); ctx.arc(x, y - bob, r + 18, 0, 6.28); ctx.stroke(); ctx.restore(); }
    // estrelles aconseguides (millor nivell)
    if (this.p) { const st = Profiles.gameStars(this.p, id).best; for (let i = 0; i < 3; i++) drawStar(ctx, x - 26 + i * 26, y + r + 20, 12, i < st, { blur: 2 }); }
    if (hov) this.hoverId = id;
  }
  drawHUD(ctx) {
    // logo sobre una pastilla blanca ajustada (sense UTAC: és a la portada i a Crèdits)
    { const lh = 52, lw = logoWidth(lh); ctx.save(); drawPanel(ctx, 24, 20, lw + 64, 84, { r: 42, border: false, blur: 16 }); drawLogo(ctx, 24 + 32 + lw / 2, 62, lh); ctx.restore(); }
    let gx = W - 24 - 42;
    if (this.p) {
      const name = this.p.name, stars = Profiles.totalStars(this.p);
      ctx.save(); ctx.font = `800 26px ${FONT_T}`; const w = ctx.measureText(name).width + 210;
      drawPanel(ctx, W - 24 - w, 20, w, 84, { r: 42, border: false, blur: 16 });
      drawAvatar(ctx, W - 24 - w + 46, 64, 70, ANIMALS[this.p.animal].id, PLUSH[this.p.color]);
      text(ctx, name, W - 24 - w + 92, 62, { size: 26, weight: 800, font: FONT_T, color: BRAND.tinta, align: "left" });
      drawStar(ctx, W - 100, 62, 20, true, { blur: 3 }); text(ctx, String(stars), W - 72, 63, { size: 26, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
      ctx.restore(); gx = W - 24 - w - 16 - 42;
    }
    // rodeta d'opcions, al costat del jugador
    drawGearButton(ctx, gx, 62, this, 1);
  }
  drawCard(ctx) {
    const g = Games.byId[this.at]; if (!g) return;
    const ct = Math.max(0, this.cardT), k = Ease.outBack(clamp(ct / 0.45, 0, 1)), sw = Settings.reduceMotion ? 0 : Math.sin(ct * 4) * Math.exp(-ct * 2.2) * 0.06;
    const cw = 500, ch = 660, cx = W - cw - 40, cy = 130 - (1 - k) * 760, open = this.open.has(this.at);
    ctx.save(); ctx.translate(cx + cw / 2, cy - 30); ctx.rotate(sw); ctx.translate(-(cx + cw / 2), -(cy - 30));
    ctx.strokeStyle = "#C9B28A"; ctx.lineWidth = 4; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + cw / 2 + s * 150, cy - 140); ctx.lineTo(cx + cw / 2 + s * 170, cy + 8); ctx.stroke(); }
    Mouse.add(cx, cy, cw, ch, {}); // la fitxa tapa els cartells de sota
    drawPanel(ctx, cx, cy, cw, ch, { r: 30 });
    // creu per tancar la fitxa
    { const bx = cx + cw - 6, by = cy + 6, ov = k > 0.99 && Mouse.add(bx - 30, by - 30, 60, 60, { click: () => this.closeCard() });
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.beginPath(); ctx.arc(bx, by, 26, 0, 6.28); ctx.fillStyle = ov ? BRAND.petroli : "#fff"; ctx.fill(); ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.beginPath(); ctx.arc(bx, by, 26, 0, 6.28); ctx.stroke();
      ctx.strokeStyle = ov ? "#fff" : BRAND.tinta; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(bx - 9, by - 9); ctx.lineTo(bx + 9, by + 9); ctx.moveTo(bx + 9, by - 9); ctx.lineTo(bx - 9, by + 9); ctx.stroke(); }
    ctx.save(); rr(ctx, cx + 20, cy + 20, cw - 40, 250, 20); ctx.clip(); try { g.thumb(ctx, cx + 20, cy + 20, cw - 40, 250, this.t); } catch (e) { } if (!open) { ctx.fillStyle = "rgba(240,240,236,0.85)"; ctx.fillRect(cx, cy, cw, 300); } ctx.restore();
    ctx.strokeStyle = BRAND.petroli; ctx.lineWidth = 3; rr(ctx, cx + 20, cy + 20, cw - 40, 250, 20); ctx.stroke();
    text(ctx, ZONES[g.zone] ? ZONES[g.zone].name : "", cx + 30, cy + 296, { size: 20, weight: 800, font: FONT_T, color: BRAND.petroli, align: "left" });
    text(ctx, g.name, cx + 30, cy + 334, { size: 38, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
    if (!open) {
      const need = 3 * (Games.sorted().map(q => q.id).filter(id => !START_OPEN.includes(id)).indexOf(this.at) + 1) - Profiles.totalStars(this.p);
      text(ctx, `Tancat. Aconsegueix ${Math.max(1, need)} estrelles més per obrir-lo.`, cx + 30, cy + 400, { size: 22, weight: 700, color: "#4B6366", align: "left" });
      ctx.restore(); return;
    }
    const lvl = this.level();
    wrapText(ctx, g.goal(lvl), cx + 30, cy + 380, cw - 60, 29, { size: 22, weight: 700, color: "#3D5558" });
    // nivells 1-6 amb les estrelles
    const per = this.p ? Profiles.gameStars(this.p, this.at).per : {};
    for (let i = 1; i <= 6; i++) {
      const lx = cx + 30 + (i - 1) * 74, ly = cy + 496, on = i === lvl;
      const lh = k > 0.99 && Mouse.add(lx - 4, ly - 4, 68, 104, { click: () => this.setLevel(i) });
      drawKeycap(ctx, lx, ly, 60, 60, String(i), { theme: on ? "petroli" : lh ? "menta" : "white", pressed: on, size: 32 });
      const s = per[i] || 0; for (let j = 0; j < 3; j++) drawStar(ctx, lx + 12 + j * 18, ly + 82, 8, j < s, { blur: 1 });
    }
    text(ctx, "Nivell " + lvl + ": " + LEVEL_NAMES[lvl], cx + 30, cy + 474, { size: 18, weight: 800, font: FONT_T, color: BRAND.petroli, align: "left" });
    // botó Jugar
    const bw = 260, bh = 70, bx = cx + cw / 2 - bw / 2, by = cy + ch - 40 - bh / 2, bov = k > 0.99 && Mouse.add(bx, by, bw, bh, { click: () => this.play() });
    rr(ctx, bx, by, bw, bh, bh / 2); ctx.fillStyle = bov ? BRAND.petroli : BRAND.menta; ctx.fill();
    text(ctx, "Jugar", cx + cw / 2, cy + ch - 39, { size: 32, weight: 900, font: FONT_T, color: bov ? "#fff" : BRAND.tinta });
    ctx.restore();
  }
  /* racó de l'aigua amb la barca del viatge de calibratge */
  drawVoyageToken(ctx) {
    const [x, y] = VOYAGE_POS, t = this.t, bob = Math.sin(t * 1.6) * 5;
    const [s0x, s0y] = this.worldToScreen(x - 110, y - 150), [s1x, s1y] = this.worldToScreen(x + 110, y + 50);
    const hov = this.introT >= 1.4 && Mouse.add(s0x, s0y, s1x - s0x, s1y - s0y, { click: () => { this.cardVoy = true; this.cardOpen = true; this.cardT = 0; Sfx.play("whoosh"); } });
    if (hov) this.hoverVoy = true;
    ctx.save(); ctx.translate(x, y + bob);
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath(); ctx.ellipse(0, 34, 120, 14, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = "#6B4429"; ctx.fillRect(-4, -130, 8, 130);
    Mat.paperCut(ctx, c2 => { c2.beginPath(); c2.moveTo(8, -124); c2.quadraticCurveTo(90, -70, 10, -14); c2.closePath(); }, "#FFF8EA", { depth: 4, seed: 51 });
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(10, -76, 52, 12);
    ctx.fillStyle = UI.coral; ctx.beginPath(); ctx.moveTo(4, -130); ctx.lineTo(36, -122 + Math.sin(t * 7) * 3); ctx.lineTo(4, -114); ctx.closePath(); ctx.fill();
    Mat.paperCut(ctx, c2 => { c2.beginPath(); c2.moveTo(-100, -6); c2.lineTo(96, -6); c2.quadraticCurveTo(84, 26, 56, 32); c2.lineTo(-70, 32); c2.quadraticCurveTo(-94, 22, -100, -6); c2.closePath(); }, "#A0623A", { depth: 5, seed: 52 });
    ctx.fillStyle = BRAND.petroli; ctx.fillRect(-98, 4, 192, 8);
    if (hov || (this.cardOpen && this.cardVoy)) { ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 6; ctx.setLineDash([14, 10]); ctx.lineDashOffset = t * 30; ctx.beginPath(); ctx.ellipse(0, -40, 130, 110, 0, 0, 6.28); ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
  }
  drawVoyageCard(ctx) {
    const ct = Math.max(0, this.cardT), k = Ease.outBack(clamp(ct / 0.45, 0, 1));
    const cw = 500, ch = 520, cx = W - cw - 40, cy = 130 - (1 - k) * 760;
    ctx.save(); Mouse.add(cx, cy, cw, ch, {});
    drawPanel(ctx, cx, cy, cw, ch, { r: 30 });
    this.closeBtn(ctx, cx + cw - 6, cy + 6, k);
    ctx.save(); rr(ctx, cx + 20, cy + 20, cw - 40, 210, 20); ctx.clip(); const sp = this.voyThumb || (this.voyThumb = new VoyageScene(null)); sp.t = this.t; sp.prog = 0.55;
    ctx.translate(cx + 20, cy + 20); ctx.scale((cw - 40) / W, 210 / (H * 0.62)); ctx.translate(0, -H * 0.3); try { sp.drawThumb(ctx); } catch (e) { } ctx.restore();
    ctx.strokeStyle = BRAND.petroli; ctx.lineWidth = 3; rr(ctx, cx + 20, cy + 20, cw - 40, 210, 20); ctx.stroke();
    text(ctx, "Calibratge", cx + 30, cy + 258, { size: 20, weight: 800, font: FONT_T, color: BRAND.petroli, align: "left" });
    text(ctx, "El viatge a l'illa", cx + 30, cy + 296, { size: 38, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
    const c = this.p && this.p.calib;
    wrapText(ctx, c ? `Darrer viatge: ${c.found} de ${c.n} lletres trobades. Tornar-lo a fer actualitza el nivell i el ritme dels jocs.` : "Troba les lletres al teclat mentre la barca navega cap a l'illa. Serveix per ajustar el nivell i el ritme dels jocs.", cx + 30, cy + 342, cw - 60, 29, { size: 22, weight: 700, color: "#3D5558" });
    drawButton(ctx, cx + cw / 2, cy + ch - 56, "Fer el viatge", { fs: 30, w: 300, h: 70, style: "primary", click: k > 0.99 ? () => { Sfx.play("go"); App.go(new VoyageScene(this.p)); } : null });
    ctx.restore();
  }
  closeBtn(ctx, bx, by, k) {
    const ov = k > 0.99 && Mouse.add(bx - 30, by - 30, 60, 60, { click: () => this.closeCard() });
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.beginPath(); ctx.arc(bx, by, 26, 0, 6.28); ctx.fillStyle = ov ? BRAND.petroli : "#fff"; ctx.fill(); ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.beginPath(); ctx.arc(bx, by, 26, 0, 6.28); ctx.stroke();
    ctx.strokeStyle = ov ? "#fff" : BRAND.tinta; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(bx - 9, by - 9); ctx.lineTo(bx + 9, by + 9); ctx.moveTo(bx + 9, by - 9); ctx.lineTo(bx - 9, by + 9); ctx.stroke();
  }
  clickPlace(id) {
    this.cardVoy = false;
    if (id === this.at && !this.walk) { if (!this.cardOpen) { this.cardOpen = true; this.cardT = 0; this.free = null; Sfx.play("whoosh"); this.sayPlace(); } return; }
    this.goTo(id); Sfx.play("key");
  }
  closeCard() { this.cardOpen = false; Sfx.play("whoosh"); Voice.stop && Voice.stop(); }
  play() {
    if (this.walk) return;
    if (!this.open.has(this.at)) { Sfx.play("miss"); return; }
    const g = Games.byId[this.at]; Sfx.play("go");
    const [sx, sy] = this.worldToScreen(...PLACES[this.at]);
    App.go(new GameScene(g, this.level(), this.p), { from: [sx, sy] });
  }
  setLevel(n) { this.levels[this.at] = n; Store.set("levels." + (this.p ? this.p.id : "x"), this.levels); Sfx.play("tick"); }
  // a l'illa es navega només amb el ratolí (decisió de Marc, 19-10-2026); el teclat queda per als jocs
  onKey(k) { if (this.credits && (k === "Escape" || k === "Enter" || k === " ")) { this.credits = false; return; } if (this.opts && k === "Escape") { this.opts = false; return; } if (this.introT < 1.4) this.introT = 1.4; }
}
function wrapText(ctx, s, x, y, maxW, lh, o = {}) {
  ctx.save(); ctx.font = `${o.weight || 700} ${o.size || 24}px ${o.font || FONT_L}`; ctx.fillStyle = o.color || BRAND.tinta; ctx.textAlign = o.align || "left"; ctx.textBaseline = "middle";
  const words = s.split(" "); let line = "", yy = y;
  for (const w of words) { const test = line ? line + " " + w : w; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
  if (line) ctx.fillText(line, x, yy); ctx.restore(); return yy;
}

/* ---------- Museu ---------- */
class MuseumScene {
  constructor(p) { this.p = p; this.sel = 0; this.t = 0; this.big = false; }
  enter() { Music.play("piano"); }
  update(dt) { this.t += dt; }
  draw(ctx) {
    ctx.fillStyle = ctx.createPattern(Tex.paper(512, 512, "#EFE6D2", { seed: 101 }), "repeat"); ctx.fillRect(0, 0, W, H);
    // parquet
    ctx.save(); ctx.fillStyle = ctx.createPattern(Tex.wood(512, 128, "#B68352", { seed: 103 }), "repeat"); ctx.fillRect(0, 760, W, 140); ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(0, 760, W, 6); ctx.restore();
    text(ctx, "El museu", W / 2, 70, { size: 54, weight: 900, font: FONT_T, color: BRAND.tinta });
    const G = Games.sorted(), cols = 9, cw = 162, chh = 210, x0 = W / 2 - cols * cw / 2, y0 = 130;
    G.forEach((g, i) => {
      const c = i % cols, r = Math.floor(i / cols), x = x0 + c * cw + 8, y = y0 + r * chh;
      if (!this.big) Mouse.add(x, y, cw - 16, chh - 24, { hover: () => { if (this.sel !== i) { this.sel = i; Sfx.play("tick"); } }, click: () => { this.sel = i; this.big = true; Sfx.play("tick"); } });
      const sel = i === this.sel;
      const n = (this.p && this.p.collect && this.p.collect[g.id]) || 0;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = sel ? 24 : 10; ctx.shadowOffsetY = 6; rr(ctx, x, y, cw - 16, chh - 24, 16); ctx.fillStyle = sel ? "#fff" : "#FAF6EE"; ctx.fill(); ctx.restore();
      ctx.save(); rr(ctx, x + 10, y + 10, cw - 36, 110, 10); ctx.clip(); try { g.thumb(ctx, x + 10, y + 10, cw - 36, 110, sel ? this.t : 0); } catch (e) { } if (!n) { ctx.fillStyle = "rgba(240,236,228,0.82)"; ctx.fillRect(x, y, cw, 130); } ctx.restore();
      if (sel) { ctx.lineWidth = 5; ctx.strokeStyle = BRAND.petroli; rr(ctx, x, y, cw - 16, chh - 24, 16); ctx.stroke(); }
      const mfs = Math.min(18, 18 * (cw - 30) / Math.max(1, measure(ctx, g.collect.many, 18, 800, FONT_T))); text(ctx, g.collect.many, x + (cw - 16) / 2, y + 142, { size: mfs, weight: 800, font: FONT_T, color: BRAND.tinta });
      text(ctx, n ? "× " + n : "—", x + (cw - 16) / 2, y + 168, { size: 22, weight: 900, font: FONT_T, color: n ? BRAND.petroli : "#9AA" });
    });
    const g = G[this.sel], n = (this.p && this.p.collect && this.p.collect[g.id]) || 0;
    ctx.save(); ctx.fillStyle = "rgba(32,62,66,0.92)"; ctx.fillRect(0, H - 76, W, 76);
    text(ctx, `${g.name}: ${n ? n + " " + (n === 1 ? g.collect.one : g.collect.many) : "encara no n'hi ha cap"}`, 40, H - 38, { size: 26, weight: 800, font: FONT_T, color: "#fff", align: "left" });
    drawButton(ctx, W - 40, H - 38, "Tornar a l'illa", { align: "right", fs: 22, h: 46, style: "ghost", click: this.big ? null : () => this.onKey("Escape") });
    ctx.restore();
    if (this.big) {
      Mouse.add(0, 0, W, H, { click: () => { this.big = false; } });
      ctx.save(); ctx.fillStyle = "rgba(20,38,42,0.7)"; ctx.fillRect(0, 0, W, H);
      drawPanel(ctx, 260, 110, W - 520, 620, { r: 30 }); ctx.save(); rr(ctx, 290, 140, W - 580, 500, 20); ctx.clip(); g.thumb(ctx, 290, 140, W - 580, 500, this.t); ctx.restore();
      text(ctx, g.name, W / 2, 690, { size: 36, weight: 900, font: FONT_T, color: BRAND.tinta });
      ctx.restore();
    }
  }
  onKey(k) {
    const N = Games.list.length;
    if (this.big) { this.big = false; return; }
    if (k === "ArrowRight") this.sel = (this.sel + 1) % N; else if (k === "ArrowLeft") this.sel = (this.sel + N - 1) % N;
    else if (k === "ArrowDown") this.sel = Math.min(N - 1, this.sel + 9); else if (k === "ArrowUp") this.sel = Math.max(0, this.sel - 9);
    else if (k === "Enter") this.big = true;
    else if (k === "Escape" || k === "Tab") { App.go(new IslandScene(this.p)); return; }
    Sfx.play("tick");
  }
}

/* ---------- Docent ---------- */
/* Accés docent amb codi de 4 xifres.
   - El primer cop (encara no hi ha codi) es demana crear-lo i repetir-lo.
   - "No recordo el codi": si es resol bé una multiplicació de dos nombres de dues xifres, es pot crear un codi nou.
   - Des de la pantalla d'alumnes es pot canviar (mode "set" amb tornada al docent).
   El codi es desa resumit (bsnHash), no en clar. */
const teacherCodeSet = () => !!Settings.codeH;
class CodeScene {
  constructor(back, o = {}) {
    this.back = back || (() => new TitleScene()); this.o = o; // o.change: canvi des de dins; o.after: on anar en acabar
    this.mode = o.change || !teacherCodeSet() ? "set" : "enter";
    this.code = ""; this.first = null; this.t = 0; this.err = 0; this.msg = "";
  }
  update(dt) { this.t += dt; this.err = Math.max(0, this.err - dt); }
  newSum() { this.a = randi(12, 99); this.b = randi(12, 99); this.code = ""; }
  draw(ctx) {
    ctx.fillStyle = BRAND.menta; ctx.fillRect(0, 0, W, H);
    drawPanel(ctx, W / 2 - 400, 170, 800, 480, { r: 30 });
    drawLogo(ctx, W / 2, 240, 56);
    const M = this.mode, maths = M === "forgot";
    const title = M === "enter" ? "Accés docent" : maths ? "No recordo el codi" : this.first == null ? (this.o.change ? "Codi nou" : "Crea el codi docent") : "Repeteix el codi";
    text(ctx, title, W / 2, 322, { size: 40, weight: 900, font: FONT_T, color: BRAND.tinta });
    if (maths) {
      text(ctx, `${this.a} × ${this.b} =`, W / 2 - 20, 410, { size: 52, weight: 900, font: FONT_T, color: BRAND.tinta, align: "right" });
      rr(ctx, W / 2, 372, 200, 76, 16); ctx.fillStyle = BRAND.crema; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.stroke();
      text(ctx, this.code + (Math.floor(this.t * 2) % 2 ? "|" : " "), W / 2 + 20, 412, { size: 46, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
      drawButton(ctx, W / 2, 500, "Comprova", { fs: 24, h: 52, w: 220, style: "primary", click: () => this.onKey("Enter") });
    } else {
      for (let i = 0; i < 4; i++) { const x = W / 2 - 150 + i * 80 + (this.err ? Math.sin(this.t * 60) * 6 : 0); drawKeycap(ctx, x, 370, 64, 64, this.code[i] ? "•" : "", { theme: this.code[i] ? "petroli" : "white" }); }
    }
    const sub = this.msg || (M === "enter" ? "Escriu el codi de 4 xifres" : maths ? "Resol la multiplicació per poder crear un codi nou" : this.first == null ? "Tria un codi de 4 xifres. El demanarà cada vegada." : "Escriu-lo una altra vegada per confirmar-lo");
    text(ctx, sub, W / 2, maths ? 580 : 490, { size: 22, weight: 700, color: this.msg ? UI.coralDark : "#4B6366" });
    if (M === "enter") drawButton(ctx, W / 2, 580, "No recordo el codi", { fs: 20, h: 44, style: "light", click: () => { this.mode = "forgot"; this.msg = ""; this.newSum(); Sfx.play("tick"); } });
    // teclat numèric per al ratolí
    "1234567890".split("").forEach((d, i) => {
      const x = W / 2 - 5 * 66 + i * 66 + 3, y = 690, ov = Mouse.add(x, y, 60, 60, { click: () => this.onKey(d) });
      drawKeycap(ctx, x, y, 60, 60, d, { theme: ov ? "menta" : "white", size: 30 });
    });
    const ov = Mouse.add(W / 2 + 5 * 66 + 16, 690, 60, 60, { click: () => this.onKey("Backspace") }); drawKeycap(ctx, W / 2 + 5 * 66 + 16, 690, 60, 60, "⌫", { theme: ov ? "menta" : "white", size: 28 });
    drawButton(ctx, W - 40, 50, maths || (this.o.change) ? "Tornar" : "Sortir", { align: "right", fs: 22, h: 46, click: () => this.onKey("Escape") });
  }
  fail(msg) { this.err = 0.5; this.code = ""; this.msg = msg || ""; Sfx.play("miss"); }
  done() { App.go(this.o.after ? this.o.after() : new TeacherScene(this.back)); }
  onKey(k) {
    if (k === "Escape") {
      if (this.mode === "forgot") { this.mode = "enter"; this.code = ""; this.msg = ""; return; }
      App.go(this.o.after && this.o.change ? this.o.after() : this.back()); return;
    }
    if (k === "Backspace") { this.code = this.code.slice(0, -1); return; }
    if (this.mode === "forgot") {
      if (/^[0-9]$/.test(k) && this.code.length < 4) { this.code += k; Sfx.play("key"); this.msg = ""; }
      if (k === "Enter" && this.code) {
        if (Number(this.code) === this.a * this.b) { Sfx.play("ding"); this.mode = "set"; this.first = null; this.code = ""; this.msg = ""; }
        else { this.newSum(); this.fail("No és correcte. Prova amb aquesta altra."); }
      }
      return;
    }
    if (!/^[0-9]$/.test(k)) return;
    this.code += k; this.msg = ""; Sfx.play("key");
    if (this.code.length < 4) return;
    if (this.mode === "enter") {
      if (bsnHash(this.code) === Settings.codeH) this.done(); else this.fail("No és correcte");
      return;
    }
    // mode "set": dues vegades el mateix codi
    if (this.first == null) { this.first = this.code; this.code = ""; return; }
    if (this.code !== this.first) { this.first = null; this.fail("No coincideixen. Torna a triar el codi."); return; }
    Settings.codeH = bsnHash(this.code); delete Settings.code; saveSettings(); Sfx.play("ding"); this.done();
  }
}
class TeacherScene {
  constructor(back) { this.back = back || (() => new TitleScene()); this.tab = 1; this.sel = 0; this.t = 0; this.stu = 0; } // les opcions són a la rodeta; aquí només alumnes i resultats
  update(dt) { this.t += dt; }
  items() {
    if (this.tab === 0) return [
      ["Lletres en majúscula", () => Settings.upper, () => Settings.upper = !Settings.upper],
      ["Veu", () => Settings.voice, () => Settings.voice = !Settings.voice],
      ["Música", () => Settings.music, () => { Settings.music = !Settings.music; }],
      ["Efectes de so", () => Settings.sfx, () => Settings.sfx = !Settings.sfx],
      ["Ajudes al teclat en pantalla", () => Settings.hints, () => Settings.hints = !Settings.hints],
      ["Moviment reduït", () => Settings.reduceMotion, () => Settings.reduceMotion = !Settings.reduceMotion],
      ["Tots els jocs oberts", () => Settings.allOpen !== false, () => Settings.allOpen = Settings.allOpen === false],
      ["Lletres del viatge de calibratge", () => Settings.calibN || 20, () => { }],
    ];
    return Profiles.list.map(p => [p.name, null, null, p]);
  }
  draw(ctx) {
    ctx.fillStyle = "#F4F8F6"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, 100); ctx.fillStyle = "#DDE7E4"; ctx.fillRect(0, 100, W, 2);
    drawLogo(ctx, 190, 50, 46);
    text(ctx, "Alumnes i resultats", 460, 51, { size: 32, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
    drawButton(ctx, W - 40, 51, "Sortir", { align: "right", fs: 22, h: 46, click: () => this.onKey("Escape") });
    drawButton(ctx, W - 160, 51, "Canviar el codi", { align: "right", fs: 22, h: 46, click: () => { const back = this.back; App.go(new CodeScene(back, { change: true, after: () => new TeacherScene(back) })); } });
    const it = this.items();
    if (this.tab === 0) {
      it.forEach(([l, get], i) => {
        const y = 150 + i * 76;
        Mouse.add(120, y, 760, 62, { hover: () => { this.sel = i; }, click: () => { this.sel = i; this.onKey("Enter"); Sfx.play("tick"); } });
        const sel = i === this.sel;
        rr(ctx, 120, y, 760, 62, 14); ctx.fillStyle = sel ? "#E3EFEB" : "#fff"; ctx.fill(); if (sel) { ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.stroke(); }
        text(ctx, l, 150, y + 32, { size: 26, weight: 700, color: BRAND.tinta, align: "left" });
        const on = get();
        if (typeof on === "number") { // nombre de lletres del viatge (5-27)
          const ch = d => () => { Settings.calibN = clamp(on + d, 5, 27); saveSettings(); Sfx.play("tick"); };
          drawButton(ctx, 700, y + 31, "−", { align: "left", fs: 22, w: 42, h: 40, click: ch(-1) }); text(ctx, String(on), 770, y + 32, { size: 24, weight: 900, font: FONT_T, color: BRAND.tinta }); drawButton(ctx, 812, y + 31, "+", { align: "left", fs: 22, w: 42, h: 40, click: ch(1) });
        } else { rr(ctx, 790, y + 14, 66, 34, 17); ctx.fillStyle = on ? BRAND.petroli : "#C4D2CF"; ctx.fill(); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(on ? 839 : 807, y + 31, 13, 0, 6.28); ctx.fill(); }
      });
    } else {
      if (!it.length) { text(ctx, "Encara no hi ha cap alumne.", W / 2, 300, { size: 30, weight: 700, color: "#4B6366" }); return; }
      this.sel = clamp(this.sel, 0, it.length - 1);
      it.forEach(([l, , , p], i) => {
        const y = 140 + i * 56; if (y > H - 120) return;
        Mouse.add(60, y, 360, 46, { click: () => { this.sel = i; Sfx.play("tick"); } });
        const sel = i === this.sel;
        rr(ctx, 60, y, 360, 46, 12); ctx.fillStyle = sel ? BRAND.petroli : "#fff"; ctx.fill();
        text(ctx, l, 84, y + 24, { size: 22, weight: 800, font: FONT_T, color: sel ? "#fff" : BRAND.tinta, align: "left" });
        text(ctx, "★ " + Profiles.totalStars(p), 400, y + 24, { size: 20, weight: 800, font: FONT_T, color: sel ? "#fff" : BRAND.petroli, align: "right" });
      });
      const p = it[this.sel][3];
      drawPanel(ctx, 460, 130, 1080, 680, { r: 20, border: "#DDE7E4", blur: 8 });
      text(ctx, p.name, 500, 175, { size: 34, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
      // estrelles per joc i nivell
      Games.sorted().forEach((g, i) => {
        const c = i % 2, r = Math.floor(i / 2), x = 500 + c * 520, y = 214 + r * 27;
        text(ctx, g.id + ". " + g.name, x, y, { size: 18, weight: 700, color: BRAND.tinta, align: "left" });
        const per = Profiles.gameStars(p, g.id).per;
        for (let l = 1; l <= 6; l++) text(ctx, String(per[l] || 0), x + 330 + l * 26, y, { size: 18, weight: 800, font: FONT_T, color: per[l] ? BRAND.petroli : "#B5C4C1" });
      });
      // confusions més freqüents
      const conf = Object.entries(p.conf || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
      text(ctx, "Confusions més freqüents (demanada → premuda):", 500, 572, { size: 18, weight: 800, font: FONT_T, color: BRAND.petroli, align: "left" });
      text(ctx, conf.length ? conf.map(([k, n]) => `${k} (${n})`).join("   ") : "cap", 500, 600, { size: 20, weight: 700, color: BRAND.tinta, align: "left" });
      this.drawTune(ctx, p);
      // esborrar amb confirmació (ratolí o Supr dues vegades)
      const dl = this.confirmDel === p ? "Segur? Torna a clicar per esborrar " + p.name : "Esborrar " + p.name;
      drawButton(ctx, 1510, 175, dl, { align: "right", fs: 20, h: 44, style: this.confirmDel === p ? "primary" : "light", click: () => this.onKey("Delete") });
    }
  }
  /* viatge de calibratge i ajust que l'adult pot corregir */
  drawTune(ctx, p) {
    ctx.fillStyle = "#DDE7E4"; ctx.fillRect(500, 626, 1000, 2);
    const c = p.calib;
    text(ctx, "Viatge de calibratge", 500, 656, { size: 20, weight: 900, font: FONT_T, color: BRAND.petroli, align: "left" });
    let info = "Encara no l'ha fet.";
    if (c) { const d = new Date(c.date), slow = c.items.filter(i => !i.timeout).sort((a, b) => b.rt - a.rt).slice(0, 4).map(i => i.l).join(", "), miss = c.items.filter(i => i.timeout).map(i => i.l).join(", ");
      info = `${d.toLocaleDateString("ca")}: ${c.found}/${c.n} trobades, ${c.first} a la primera, temps mitjà ${String(c.med).replace(".", ",")} s.` + (slow ? ` Més lentes: ${slow}.` : "") + (miss ? ` No trobades: ${miss}.` : ""); }
    wrapText(ctx, info, 760, 656, 740, 24, { size: 17, weight: 700, color: BRAND.tinta });
    if (p.redoCalib) text(ctx, "El repetirà en la propera entrada.", 500, 690, { size: 16, weight: 700, color: UI.coralDark, align: "left" });
    const tu = tuneOf(p), set = (k, v) => { p.tune = Object.assign({}, tuneOf(p), { [k]: v }); Profiles.save(); Sfx.play("tick"); };
    const step = (x, label, val, dec, inc) => {
      text(ctx, label, x, 736, { size: 18, weight: 800, font: FONT_T, color: "#4B6366", align: "left" });
      drawButton(ctx, x, 774, "−", { align: "left", fs: 24, w: 46, h: 44, click: dec });
      text(ctx, val, x + 96, 775, { size: 24, weight: 900, font: FONT_T, color: BRAND.tinta });
      drawButton(ctx, x + 146, 774, "+", { align: "left", fs: 24, w: 46, h: 44, click: inc });
    };
    step(500, "Nivell inicial", String(tu.level), () => set("level", Math.max(1, tu.level - 1)), () => set("level", Math.min(6, tu.level + 1)));
    step(730, "Ritme dels jocs", Math.round(tu.speed * 100) + "%", () => set("speed", Math.max(0.6, Math.round((tu.speed - 0.05) * 100) / 100)), () => set("speed", Math.min(1.5, Math.round((tu.speed + 0.05) * 100) / 100)));
    step(960, "Ajuda després de", tu.hint + " s", () => set("hint", Math.max(2, tu.hint - 1)), () => set("hint", Math.min(15, tu.hint + 1)));
    drawButton(ctx, 1500, 774, p.redoCalib ? "Viatge pendent" : "Repetir el viatge", { align: "right", fs: 20, h: 44, style: p.redoCalib ? "light" : "primary", click: () => { p.redoCalib = !p.redoCalib; Profiles.save(); Sfx.play("tick"); } });
  }
  onKey(k) {
    const it = this.items();
    if (k === "Escape") { saveSettings(); Music.refresh(); App.go(this.back()); return; }
    if (k === "ArrowDown") this.sel = Math.min(it.length - 1, this.sel + 1);
    if (k === "ArrowUp") this.sel = Math.max(0, this.sel - 1);
    if (k === "Enter" && this.tab === 0 && it[this.sel]) { it[this.sel][2](); saveSettings(); }
    if (k === "Delete" && this.tab === 1 && it[this.sel]) { const p = it[this.sel][3]; if (this.confirmDel === p) { Profiles.remove(p); this.sel = 0; this.confirmDel = null; Sfx.play("thud"); } else { this.confirmDel = p; Sfx.play("tick"); } return; }
    this.confirmDel = null;
  }
}

/* finestra d'opcions de l'illa (rodeta): opcions del joc i els botons Crèdits, Museu i Canviar de jugador */
const ISLAND_OPTS = [
  // columna esquerra
  ["Lletres en majúscula", () => Settings.upper, () => Settings.upper = !Settings.upper],
  ["Veu", () => Settings.voice, () => Settings.voice = !Settings.voice, null, null, null, () => VoicePanel.open()],
  ["Música", () => Settings.music, () => { Settings.music = !Settings.music; Music.refresh && Music.refresh(); }],
  ["Efectes de so", () => Settings.sfx, () => Settings.sfx = !Settings.sfx],
  ["Pantalla completa", () => !!document.fullscreenElement, () => {
    Settings.fullscreen = !document.fullscreenElement;
    try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) { }
  }],
  // columna dreta
  ["Explicació del joc", () => Settings.intro || "sempre", null, [["sempre", "Sempre"], ["primer", "El primer cop"], ["mai", "Mai"]], v => Settings.intro = v],
  ["Ajudes al teclat en pantalla", () => Settings.hints, () => Settings.hints = !Settings.hints],
  ["Moviment reduït", () => Settings.reduceMotion, () => Settings.reduceMotion = !Settings.reduceMotion],
  ["Tots els jocs oberts", () => Settings.allOpen !== false, scene => { Settings.allOpen = Settings.allOpen === false; if (scene instanceof IslandScene) scene.open = unlockedSet(scene.p); }],
  ["Lletres del viatge inicial", () => Settings.calibN || 20, null, null, null, [5, 27, v => Settings.calibN = v]],
];
function drawGearButton(ctx, gx, gy, scene, sc) {
  const R = 42 * sc, ov = !scene.opts && Mouse.add(gx - R, gy - R, 2 * R, 2 * R, { click: () => { scene.opts = true; scene.optsT = 0; Sfx.play("whoosh"); } });
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.22)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4; ctx.beginPath(); ctx.arc(gx, gy, R, 0, 6.28); ctx.fillStyle = ov ? BRAND.menta : "#fff"; ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(gx, gy); ctx.scale(1.35 * sc, 1.35 * sc); if (ov && !Settings.reduceMotion) ctx.rotate(scene.t * 1.5); bsnGear(ctx, 0, 0, BRAND.petroli); ctx.restore();
}
function drawIslandOptions(ctx, scene) {
  const k = Ease.outBack(clamp(scene.optsT / 0.4, 0, 1));
  ctx.save(); ctx.fillStyle = `rgba(20,38,42,${0.55 * clamp(scene.optsT * 4, 0, 1)})`; ctx.fillRect(0, 0, W, H);
  Mouse.add(0, 0, W, H, { click: () => { scene.opts = false; } });
  ctx.translate(W / 2, H / 2); ctx.scale(k, k); ctx.translate(-W / 2, -H / 2);
  const pw = 1280, ph = 590, px = W / 2 - pw / 2, py = H / 2 - ph / 2;
  Mouse.add(px, py, pw, ph, {});
  drawPanel(ctx, px, py, pw, ph, { r: 32 });
  ctx.save(); ctx.translate(px + 62, py + 58); bsnGear(ctx, 0, 0, BRAND.petroli); ctx.restore();
  text(ctx, "Opcions", px + 96, py + 58, { size: 36, weight: 900, font: FONT_T, color: BRAND.tinta, align: "left" });
  ctx.fillStyle = "#DDE7E4"; ctx.fillRect(px + 40, py + 102, pw - 80, 2);
  const colW = (pw - 100) / 2;
  ISLAND_OPTS.forEach(([l, get, set, choices, pick, step, cfg], i) => {
    const x0 = px + 40 + (i < 5 ? 0 : colW + 20), y = py + 124 + (i % 5) * 66, on = get();
    if (step) { // nombre amb − i +
      rr(ctx, x0, y, colW, 56, 14); ctx.fillStyle = "#F4F8F6"; ctx.fill();
      text(ctx, l, x0 + 26, y + 29, { size: 24, weight: 700, color: BRAND.tinta, align: "left" });
      const [mn, mx, put] = step, ch = d => () => { put(clamp(on + d, mn, mx)); saveSettings(); Sfx.play("tick"); }, rx = x0 + colW - 14;
      drawButton(ctx, rx - 150, y + 28, "−", { align: "left", fs: 22, w: 42, h: 40, click: ch(-1) });
      text(ctx, String(on), rx - 79, y + 29, { size: 24, weight: 900, font: FONT_T, color: BRAND.tinta });
      drawButton(ctx, rx - 42, y + 28, "+", { align: "left", fs: 22, w: 42, h: 40, click: ch(1) });
      return;
    }
    if (choices) { // tria entre diverses opcions (xips)
      rr(ctx, x0, y, colW, 56, 14); ctx.fillStyle = "#F4F8F6"; ctx.fill();
      text(ctx, l, x0 + 26, y + 29, { size: 24, weight: 700, color: BRAND.tinta, align: "left" });
      let cx = x0 + colW - 14;
      for (let j = choices.length - 1; j >= 0; j--) {
        const [v, lab] = choices[j], sel = v === on; ctx.font = `800 19px ${FONT_T}`; const w = ctx.measureText(lab).width + 30; cx -= w;
        const ov = Mouse.add(cx, y + 9, w, 38, { click: () => { pick(v); saveSettings(); Sfx.play("tick"); } });
        rr(ctx, cx, y + 9, w, 38, 19); ctx.fillStyle = sel ? BRAND.petroli : ov ? BRAND.menta : "#fff"; ctx.fill(); if (!sel) { ctx.lineWidth = 2; ctx.strokeStyle = "#C4D2CF"; ctx.stroke(); }
        text(ctx, lab, cx + w / 2, y + 29, { size: 19, weight: 800, font: FONT_T, color: sel ? "#fff" : BRAND.tinta });
        cx -= 8;
      }
      return;
    }
    const ov = Mouse.add(x0, y, colW, 56, { click: () => { set(scene); saveSettings(); Sfx.play("tick"); } });
    rr(ctx, x0, y, colW, 56, 14); ctx.fillStyle = ov ? BRAND.menta : "#F4F8F6"; ctx.fill();
    text(ctx, l, x0 + 26, y + 29, { size: 24, weight: 700, color: BRAND.tinta, align: "left" });
    const sx = x0 + colW - 90; rr(ctx, sx, y + 11, 66, 34, 17); ctx.fillStyle = on ? BRAND.petroli : "#C4D2CF"; ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(on ? sx + 49 : sx + 17, y + 28, 13, 0, 6.28); ctx.fill();
    if (cfg) { // botó d'ajustos al costat de l'interruptor (per exemple, els motors de veu)
      const bw = 124, bx0 = sx - bw - 18, bov = Mouse.add(bx0, y + 9, bw, 38, { click: () => { Sfx.play("tick"); cfg(); } });
      rr(ctx, bx0, y + 9, bw, 38, 19); ctx.fillStyle = bov ? BRAND.petroli : "#fff"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = bov ? BRAND.petroli : "#C4D2CF"; ctx.stroke();
      ctx.save(); ctx.translate(bx0 + 22, y + 28); ctx.scale(0.62, 0.62); bsnGear(ctx, 0, 0, bov ? "#fff" : BRAND.petroli); ctx.restore();
      text(ctx, "Ajustos", bx0 + 74, y + 29, { size: 19, weight: 800, font: FONT_T, color: bov ? "#fff" : BRAND.tinta });
    }
  });
  const by = py + ph - 64, close = () => { scene.opts = false; };
  ctx.fillStyle = "#DDE7E4"; ctx.fillRect(px + 40, by - 50, pw - 80, 2);
  drawButton(ctx, px + 40, by, "Crèdits", { align: "left", fs: 22, h: 50, click: () => { close(); scene.credits = true; Sfx.play("whoosh"); } });
  if (scene instanceof IslandScene) {
    drawButton(ctx, px + 195, by, "Museu", { align: "left", fs: 22, h: 50, click: () => { close(); App.go(new MuseumScene(scene.p)); } });
    const cw = drawButton(ctx, px + pw - 40, by, "Canviar de jugador", { align: "right", fs: 22, h: 50, style: "primary", click: () => { close(); App.go(new ProfileScene()); } });
    // accés docent (alumnes i resultats); en sortir es torna a l'illa
    drawButton(ctx, px + pw - 40 - cw - 16, by, "Accés docent", { align: "right", fs: 22, h: 50, click: () => { close(); const p = scene.p; App.go(new CodeScene(() => p && Profiles.list.includes(p) ? new IslandScene(p) : new ProfileScene())); } });
  } else drawButton(ctx, px + pw - 40, by, "Accés docent", { align: "right", fs: 22, h: 50, click: () => { close(); App.go(new CodeScene()); } });
  // creu per tancar
  const bx = px + pw - 6, cy = py + 6, ov = Mouse.add(bx - 30, cy - 30, 60, 60, { click: () => { close(); Sfx.play("whoosh"); } });
  ctx.shadowColor = "rgba(0,0,0,0.3)"; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(bx, cy, 26, 0, 6.28); ctx.fillStyle = ov ? BRAND.petroli : "#fff"; ctx.fill(); ctx.shadowColor = "transparent";
  ctx.lineWidth = 3; ctx.strokeStyle = BRAND.petroli; ctx.stroke();
  ctx.strokeStyle = ov ? "#fff" : BRAND.tinta; ctx.lineWidth = 5; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(bx - 9, cy - 9); ctx.lineTo(bx + 9, cy + 9); ctx.moveTo(bx + 9, cy - 9); ctx.lineTo(bx - 9, cy + 9); ctx.stroke();
  ctx.restore();
}
