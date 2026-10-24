"use strict";
/* ============================================================
   Contingut: lletres per nivell, síl·labes i paraules de l'idioma actiu (src/lang/*.js).
   Nivell 1 vocals · 2 consonants freqüents · 3 totes les lletres
   4 síl·labes · 5 paraules curtes · 6 paraules llargues i frases
   ============================================================ */
const LD = LANG_DATA[LANG] || LANG_DATA.ca;
const LEVEL_NAMES = ["", "Vocals", "Consonants", "Totes les lletres", "Síl·labes", "Paraules", "Paraules llargues"].map(s => s && L_(s));
const LETTERS = LD.letters;
const LETTER_NAME = LD.names;
// Parelles fàcils de confondre: al nivell 3 no surten seguides.
const CONFUSABLE = LD.confusable;
const SYLLABLES = LD.syllables;
// Paraules curtes (nivell 5): sense accents ni dígrafs difícils.
const WORDS5 = LD.words5;
// Paraules llargues (nivell 6): accents, dígrafs i frases curtes.
const WORDS6 = LD.words6;
const THEMES = LD.themes;
// lletres que es poden escriure sense accents ni tecles mortes (filtre del nivell 5)
const PLAIN_RE = new RegExp("^[" + LD.plain + "]+$");
function wordsFor(level, theme) {
  const th = THEMES[theme];
  if (level <= 5) return (th && th[5]) || WORDS5;
  return (th && th[6]) || WORDS6;
}

/* Font d'elements per nivell, sense repeticions immediates */
class Pool {
  constructor(level, o = {}) {
    this.level = level; this.o = o; this.recent = [];
    if (o.items) this.items = o.items.slice();
    else if (level <= 3) this.items = (o.letters && o.letters[level]) || LETTERS[level];
    else if (level === 4) this.items = o.syllables || SYLLABLES;
    else this.items = wordsFor(level, o.theme).map(w => lower(w));
    if (level === 5 && !o.items) { const f = this.items.filter(w => PLAIN_RE.test(w)); this.items = f.length >= 6 ? f : WORDS5.filter(w => PLAIN_RE.test(w)); }
    if (o.filter) this.items = this.items.filter(o.filter);
    if (!this.items.length) this.items = ["a", "e", "i", "o", "u"];
  }
  next(exclude = []) {
    const ex = new Set(exclude.map(x => x[0]));
    const memory = Math.min(this.items.length - 1, this.level <= 2 ? 2 : 4);
    let cand = this.items.filter(x => !this.recent.includes(x) && !ex.has(x[0]));
    if (this.level === 3 && this.recent.length) { const last = this.recent[this.recent.length - 1]; const bad = new Set(CONFUSABLE.filter(p => p.includes(last)).flat()); cand = cand.filter(x => !bad.has(x)); }
    if (!cand.length) cand = this.items.filter(x => !ex.has(x[0]));
    if (!cand.length) cand = this.items;
    const it = pick(cand); this.recent.push(it); while (this.recent.length > memory) this.recent.shift();
    return it;
  }
  /* n elements diferents (i amb inicial diferent si es pot, perquè la primera tecla triï sense ambigüitat) */
  many(n, exclude = []) {
    const out = [], used = exclude.slice();
    for (let i = 0; i < n; i++) { const it = this.next(used); out.push(it); used.push(it); }
    return out;
  }
}

/* com es diu en veu alta una lletra o un element */
function spoken(item) {
  if (item.length === 1) return LETTER_NAME[item] || item;
  return item;
}
const PRAISE = ["Molt bé!", "Fantàstic!", "Genial!", "Així m'agrada!", "Perfecte!", "Bravo!", "Increïble!", "Ho has clavat!"].map(s => L_(s));
