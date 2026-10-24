/* Retains Claude's original geometry and paper craft renderer. */
const originalPaperProp=drawProp;
drawProp=function(ctx,p,R){
  originalPaperProp(ctx,p,R);
  ctx.save();ctx.translate(p.x,p.y);
  if(p.t==='tree'){
    const s=p.s;ctx.scale(s,s);
    const leaf=c=>{blobPath(c,0,-50,34,(p.x*7+p.y)|0,.12,8);};
    ctx.save();leaf(ctx);ctx.clip();ctx.strokeStyle='rgba(31,75,36,.21)';ctx.lineWidth=1.2;
    ctx.beginPath();ctx.moveTo(0,-17);ctx.quadraticCurveTo(-3,-44,3,-78);ctx.stroke();
    for(const [yy,sgn] of [[-38,-1],[-49,1],[-61,-1]]){ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(sgn*12,yy-5,sgn*19,yy-15);ctx.stroke();}
    const g=ctx.createLinearGradient(-30,-80,28,-20);g.addColorStop(0,'rgba(255,250,202,.19)');g.addColorStop(1,'rgba(10,49,22,.13)');ctx.fillStyle=g;ctx.fillRect(-40,-90,80,90);ctx.restore();
  }else if(p.t==='house'){
    ctx.fillStyle='rgba(72,42,20,.12)';ctx.fillRect(23,-50,13,51);ctx.fillStyle='rgba(255,255,235,.23)';ctx.fillRect(-35,-49,3,49);
    ctx.strokeStyle='rgba(255,242,206,.62)';ctx.lineWidth=1.3;
    for(const xx of [-16,16]){ctx.beginPath();ctx.moveTo(xx,-40);ctx.lineTo(xx,-24);ctx.moveTo(xx-8,-32);ctx.lineTo(xx+8,-32);ctx.stroke();}
    ctx.strokeStyle='rgba(54,29,14,.20)';ctx.lineWidth=1;for(let yy=-80;yy<-52;yy+=8){let w=(yy+92)/42*46;ctx.beginPath();ctx.moveTo(-w,yy);ctx.lineTo(w,yy);ctx.stroke();}
    Mat.paperCut(ctx,c=>{c.beginPath();c.rect(19,-86,11,25)},shade(p.c,.1),{depth:2});
    ctx.fillStyle='#F1DFC0';ctx.fillRect(-11,0,22,4);ctx.fillStyle='#EAC580';ctx.beginPath();ctx.arc(4,-10,1.4,0,Math.PI*2);ctx.fill();
  }else if(p.t==='fountain'){
    ctx.strokeStyle='rgba(245,255,248,.65)';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,-2,42,19,0,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
};
const oldPaperCut=Mat.paperCut;
function refinedPaperCut(ctx,path,color,o={}){
  const d=o.depth??6;
  oldPaperCut.call(Mat,ctx,path,color,{...o,depth:d>0?d*1.35:d,shadow:o.shadow||'rgba(35,42,31,.28)'});
  if(d>0){ctx.save();path(ctx);ctx.clip();ctx.strokeStyle='rgba(255,252,225,.32)';ctx.lineWidth=1.2;ctx.translate(-1.2,-1.5);path(ctx);ctx.stroke();ctx.restore();}
}

Object.assign(PLACES, {
  1: [1150, 770], 25: [1360, 730], 17: [990, 860], 22: [1480, 880], 18: [1270, 930], 4: [1100, 1020],
  21: [420, 720], 9: [620, 640], 7: [520, 900], 19: [760, 790], 12: [380, 1050], 24: [700, 1040],
  10: [880, 1220], 8: [1120, 1290], 11: [1370, 1270], 6: [1600, 1180], 13: [1800, 1030],
  20: [930, 480], 16: [1170, 550], 15: [1420, 470], 5: [1660, 560], 14: [1860, 760],
  2: [1100, 250], 3: [1330, 200], 23: [1570, 270],
});
buildIsland=function() {
  const S = 2, c = makeCanvas(WI * S, HI * S), x = c.getContext("2d"); x.scale(S, S);
  const oldMat=Mat.paperCut;Mat.paperCut=refinedPaperCut;
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
    props.push({ t: "tree", x: px, y: py, s: 0.7 + R() * 0.6, c: ["#4E8E4A", "#5E9D4F", "#3F7E48", "#6BAA55"][Math.floor(R()*4)] });
  }
  [[1000, 700], [1080, 640], [1440, 650], [1520, 760], [1600, 900], [960, 990], [1400, 1060], [1240, 1080]].forEach(([hx, hy], i) => props.push({ t: "house", x: hx, y: hy, c: ["#E07A5F", "#F2CC8F", "#81B29A", "#E9A3B4", "#8FB6D9", "#F4A259", "#B79AD6", "#E07A5F"][i], roof: ["#A8432F", "#B5651D", "#3D6B57", "#A85A7A", "#3D5F8A", "#9E5A1E", "#6A4E99", "#7D3022"][i] }));
  [[1020, 1360], [1180, 1390], [1500, 1360], [1700, 1290], [960, 1320], [1880, 1180]].forEach(([px, py]) => props.push({ t: "palm", x: px, y: py }));
  props.push({ t: "fountain", x: 1230, y: 860 });
  props.push({ t: "dome", x: 1330, y: 330 }); props.push({ t: "rocket", x: 1490, y: 150 });
  props.sort((a, b) => a.y - b.y).forEach(p => drawProp(x, p, R));
  // rètols de zona
  for (const z in ZONES) { const Z = ZONES[z]; drawZoneBanner(x, Z.label[0], Z.label[1], Z.name, z === "espai"); }
  Mat.paperCut=oldMat;ISLAND = { c, S };
};
function buildPaperWindow(view) {
  const S=view.scale,c=makeCanvas(Math.ceil(view.w*S),Math.ceil(view.h*S)),x=c.getContext("2d");x.scale(S,S);x.translate(-view.x,-view.y);
  const oldMat=Mat.paperCut;Mat.paperCut=refinedPaperCut;
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
    props.push({ t: "tree", x: px, y: py, s: 0.7 + R() * 0.6, c: ["#4E8E4A", "#5E9D4F", "#3F7E48", "#6BAA55"][Math.floor(R()*4)] });
  }
  [[1000, 700], [1080, 640], [1440, 650], [1520, 760], [1600, 900], [960, 990], [1400, 1060], [1240, 1080]].forEach(([hx, hy], i) => props.push({ t: "house", x: hx, y: hy, c: ["#E07A5F", "#F2CC8F", "#81B29A", "#E9A3B4", "#8FB6D9", "#F4A259", "#B79AD6", "#E07A5F"][i], roof: ["#A8432F", "#B5651D", "#3D6B57", "#A85A7A", "#3D5F8A", "#9E5A1E", "#6A4E99", "#7D3022"][i] }));
  [[1020, 1360], [1180, 1390], [1500, 1360], [1700, 1290], [960, 1320], [1880, 1180]].forEach(([px, py]) => props.push({ t: "palm", x: px, y: py }));
  props.push({ t: "fountain", x: 1230, y: 860 });
  props.push({ t: "dome", x: 1330, y: 330 }); props.push({ t: "rocket", x: 1490, y: 150 });
  props.sort((a, b) => a.y - b.y).forEach(p => drawProp(x, p, R));
  // rètols de zona
  for (const z in ZONES) { const Z = ZONES[z]; drawZoneBanner(x, Z.label[0], Z.label[1], Z.name, z === "espai"); }
  Mat.paperCut=oldMat;return {c,view};
};
function drawPaperSharp(ctx,scene){
 const scale=scene.cam.z*App.dpr*App.scale;
 if(scale<=ISLAND.S){
  // Keep the whole coastline and shallow-water fringe outside the old map bounds.
  const overview=scene.paperOverview||(scene.paperOverview=buildPaperWindow({x:-160,y:-160,w:WI+320,h:HI+320,scale:ISLAND.S}));
  const v=overview.view;ctx.drawImage(overview.c,v.x,v.y,v.w,v.h);return;
 }
 const w=W/scene.cam.z,h=H/scene.cam.z,x=scene.cam.x-w/2,y=scene.cam.y-h/2;
 let cache=scene.paperWindow,v=cache?.view;
 if(!v||Math.abs(v.scale-scale)>.001||x<v.x||y<v.y||x+w>v.x+v.w||y+h>v.y+v.h){
  const margin=80;cache=scene.paperWindow=buildPaperWindow({x:x-margin,y:y-margin,w:w+2*margin,h:h+2*margin,scale});v=cache.view;
 }
 ctx.drawImage(cache.c,v.x,v.y,v.w,v.h);
}
IslandScene.prototype.draw=function(ctx) {
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
    ctx.save(); ctx.setLineDash([7, 12]); ctx.lineDashOffset = -t * 20; ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 3; islandPath(ctx, 52 + Math.sin(t * 1.2) * 6); ctx.stroke(); ctx.restore();
    drawPaperSharp(ctx,this);
    // llocs i cartells
    this.hoverId = null; this.hoverVoy = false;
    const ids = Object.keys(PLACES).map(Number).filter(id => Games.byId[id]).sort((a, b) => PLACES[a][1] - PLACES[b][1]);
    ids.forEach(id => this.drawPlace(ctx, id));
    this.drawVoyageToken(ctx);
    // avatar
    islandAvatar(ctx,this);
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
  };

ZONES.poble.label=[1240,1110];ZONES.camp.label=[445,500];ZONES.muntanya.label=[1740,420];
Object.assign(SHELL_MAP,{x:-380,y:-300,w:3160,h:2100,minZoom:.48,maxZoom:2});
IslandScene.prototype.enter=function(){baseIslandEnter.call(this);this.cam={x:1200,y:750,z:.48};this.zoomT=.48;this.free=[1200,750];this.introT=99;this.clouds=[];};
