// Genera una pàgina per revisar quin so (locució de l'Anna) sona amb cada lletra en català i castellà.
// Ús: node tools/phon_review.cjs [sortida.html]
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const tts = fs.readFileSync(path.join(ROOT, "src/tts.js"), "utf8");
const grab = name => eval("(" + tts.match(new RegExp("const " + name + " = (\\{.*\\});"))[1] + ")");
const LETTER_PHON = grab("LETTER_PHON"), LETTER_PHON_ES = grab("LETTER_PHON_ES");
const man = JSON.parse(fs.readFileSync(path.join(ROOT, "assets/sons/phonemes/manifest.json"), "utf8"));
const audio = {};
for (const [name, meta] of Object.entries(man.files)) audio[name] = "data:" + meta.mime + ";base64," + fs.readFileSync(path.join(ROOT, "assets/sons/phonemes", name)).toString("base64");
const bank = man.languages;
// assignació actual, amb la mateixa lògica que Phon.clips()
const norm = (p, lang) => (Array.isArray(p) ? p : [p]).map(x => typeof x === "object" ? { lang: x.bank, voice: bank[x.bank].defaultVoice, ph: x.ph } : { lang, voice: bank[lang].defaultVoice, ph: x });
const letters = "abcdefghijklmnñopqrstuvwxyz".split("");
const current = { ca: {}, es: {} };
for (const l of letters.concat(["ç", "à", "è", "é", "í", "ï", "ò", "ó", "ú", "ü"])) {
  if (l === "h") { current.ca[l] = []; continue; }
  const p = LETTER_PHON[l] ?? bank.ca.graphemes[l]; current.ca[l] = p == null ? [] : norm(p, "ca");
}
for (const l of letters.concat(["á", "é", "í", "ó", "ú", "ü"])) {
  if (l === "h") { current.es[l] = []; continue; }
  const p = bank.es.graphemes[l] ?? LETTER_PHON_ES[l]; current.es[l] = p == null ? [] : norm(p, "es");
}
const DATA = { bank, audio, current };
const out = process.argv[2] || path.join(ROOT, "dist", "revisio-fonemes.html");
const html = fs.readFileSync(path.join(__dirname, "phon_review.html"), "utf8").replace("/*DATA*/null", JSON.stringify(DATA));
fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html);
console.log(out, Math.round(html.length / 1024) + " KB");
