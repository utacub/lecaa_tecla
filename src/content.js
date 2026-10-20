"use strict";
/* ============================================================
   Contingut: lletres per nivell, síl·labes i paraules en català.
   Nivell 1 vocals · 2 consonants freqüents · 3 totes les lletres
   4 síl·labes · 5 paraules curtes · 6 paraules llargues i frases
   ============================================================ */
const LEVEL_NAMES = ["", "Vocals", "Consonants", "Totes les lletres", "Síl·labes", "Paraules", "Paraules llargues"];
const LETTERS = {
  1: ["a", "e", "i", "o", "u"],
  2: ["s", "l", "r", "n", "t", "m", "p", "c", "d"],
  3: "abcdefghijklmnopqrstuvwxyzç".split(""),
};
const LETTER_NAME = { a: "a", b: "be", c: "ce", d: "de", e: "e", f: "efa", g: "ge", h: "hac", i: "i", j: "jota", k: "ca", l: "ela", m: "ema", n: "ena", o: "o", p: "pe", q: "cu", r: "erra", s: "essa", t: "te", u: "u", v: "ve", w: "ve doble", x: "ics", y: "i grega", z: "zeta", "ç": "ce trencada", "à": "a oberta", "è": "e oberta", "é": "e tancada", "í": "i accentuada", "ò": "o oberta", "ó": "o tancada", "ú": "u accentuada", "ï": "i amb dièresi", "ü": "u amb dièresi", "·": "punt volat", " ": "espai" };
// Parelles fàcils de confondre: al nivell 3 no surten seguides.
const CONFUSABLE = [["b", "d"], ["p", "q"], ["m", "n"], ["u", "n"], ["i", "l"], ["c", "ç"], ["v", "w"], ["b", "p"], ["d", "q"]];
const SYLLABLES = ["ma", "me", "mi", "mo", "mu", "pa", "pe", "pi", "po", "pu", "la", "le", "li", "lo", "lu", "sa", "se", "si", "so", "su", "ta", "te", "ti", "to", "tu", "na", "ne", "ni", "no", "nu", "ra", "re", "ri", "ro", "ru", "da", "de", "di", "do", "du", "ca", "co", "cu", "ba", "be", "bo", "fa", "fe", "fo", "ga", "go", "gu", "va", "vi", "xa", "xo", "ja", "jo", "ça", "ço"];
// Paraules curtes (nivell 5): sense accents ni dígrafs difícils.
const WORDS5 = ["sol", "mar", "pa", "gat", "nas", "peix", "casa", "lluna", "tren", "camp", "poma", "pera", "sopa", "mel", "ull", "cara", "mans", "peu", "cel", "nit", "dia", "vent", "neu", "pluja", "foc", "roda", "porta", "taula", "llit", "got", "llum", "rosa", "flor", "arbre", "bosc", "riu", "illa", "ocell", "vaca", "ruc", "oca", "gos", "llop", "os", "mona", "ratolí", "bota", "barret", "nena", "nen", "avi", "tia", "pare", "mare", "bou", "cuc", "pop", "dau", "boli", "cotxe", "moto", "nau"];
// Paraules llargues (nivell 6): accents, l·l i frases curtes.
const WORDS6 = ["família", "pàgina", "música", "màquina", "plàtan", "cançó", "català", "il·lusió", "col·legi", "cel·la", "paral·lel", "tranquil·la", "pel·lícula", "bicicleta", "papallona", "tortuga", "elefant", "girafa", "hipopòtam", "maduixa", "xocolata", "taronja", "síndria", "préssec", "mandarina", "estrella", "muntanya", "escola", "biblioteca", "ordinador", "teclat", "bon dia", "bona nit", "el gat dorm", "la lluna surt", "fa sol", "plou molt", "vull aigua", "som amics"];
const THEMES = {
  animals:  { 5: ["gat", "gos", "vaca", "porc", "oca", "ruc", "llop", "os", "mona", "peix", "ocell", "ase", "cabra", "ovella", "conill", "pollet", "rata", "gall"], 6: ["papallona", "elefant", "girafa", "hipopòtam", "tortuga", "cocodril", "dofí", "pingüí", "esquirol", "cavall", "gallina", "granota", "mussol", "eriçó"] },
  granja:   { 5: ["vaca", "porc", "oca", "ruc", "gall", "cabra", "ovella", "conill", "gat", "gos", "pollet", "ase", "bou", "ànec"], 6: ["gallina", "cavall", "xai", "porquet", "pollastre", "cabreta", "oveller", "vedell", "ànec", "paó"] },
  menjar:   { 5: ["pa", "poma", "pera", "sopa", "mel", "llet", "ou", "pasta", "arròs", "pizza", "coca", "nata", "suc", "sal", "formatge"], 6: ["maduixa", "xocolata", "taronja", "síndria", "préssec", "mandarina", "galeta", "magdalena", "entrepà", "macarrons", "croqueta", "formatge"] },
  fruita:   { 5: ["poma", "pera", "kiwi", "pinya", "llima", "meló", "raïm", "figa", "pruna", "coco", "mango", "nespra"], 6: ["maduixa", "taronja", "síndria", "préssec", "mandarina", "plàtan", "cirera", "albercoc", "llimona", "magrana", "papaia"] },
  peixos:   { 5: ["tonyina", "lluç", "sarda", "orada", "rap", "pop", "sípia", "calamar", "gamba", "cranc", "anguila", "truita"], 6: ["llobarro", "cavallet de mar", "estrella de mar", "rap negre", "peix espasa", "tauró", "medusa", "sardina", "salmó", "lluç de roca"] },
  ingredients: { 5: ["farina", "ous", "sucre", "llet", "nata", "mel", "fruita", "pasta", "sal", "coco", "nous"], 6: ["maduixa", "xocolata", "mantega", "canyella", "vainilla", "llimona", "ametlles", "avellanes", "merenga", "crema"] },
  ciutats:  { 5: ["Vic", "Reus", "Olot", "Lleida", "Girona", "Blanes", "Tarragona", "Manresa", "Berga", "Sitges", "Palma", "Ripoll"], 6: ["Barcelona", "Tarragona", "Sabadell", "Terrassa", "Badalona", "Mataró", "Granollers", "Figueres", "Tortosa", "Puigcerdà", "València"] },
  noms:     { 5: ["Aina", "Pau", "Jana", "Nil", "Martí", "Laia", "Arnau", "Ona", "Biel", "Mar", "Joan", "Clara", "Pol", "Núria", "Roc", "Abril"], 6: ["carrer Sol 3", "plaça Nova 5", "carrer Mar 2", "camí Vell 8", "carrer Lluna 1", "plaça Rosa 4", "carrer Pi 6"] },
  cos:      { 5: ["ulls", "nas", "boca", "orelles", "cabells", "galtes", "pigues", "barret", "celles", "dents"], 6: ["posa ulls", "posa nas", "treu nas", "posa barret", "posa ulleres blaves", "treu boca", "posa pigues"] },
  natura:   { 5: ["flor", "rosa", "arbre", "herba", "fulla", "pi", "roure", "lliri", "cactus", "heura", "molsa"], 6: ["margarida", "gira-sol", "tulipa", "rosella", "lavanda", "romaní", "farigola", "ametller", "taronger", "olivera"] },
  festa:    { 5: ["festa", "pastís", "regal", "globus", "dolç", "ball", "riure", "joc", "cant"], 6: ["aniversari", "espelmes", "confeti", "piruleta", "serpentina", "disfressa", "pallasso"] },
  tren:     { 5: ["tren", "via", "vagó", "port", "mina", "granja", "ciutat", "pont", "riu"], 6: ["estació", "locomotora", "maquinista", "mercaderies", "túnel", "andana"] },
  musica:   { 5: ["la la la", "do re mi", "sol", "mar", "cant", "ball", "tambor", "flauta"], 6: ["cançó", "música", "guitarra", "violí", "trompeta", "orquestra"] },
  passos:   { 5: ["salta", "pica", "cap", "braços", "robot"], 6: ["salta alt", "gira rodó", "pica de mans", "cop de cap", "braços amunt", "fes el robot"] },
  espai:    { 5: ["sol", "lluna", "nau", "estel", "cel", "mart", "terra", "coet", "astre"], 6: ["planeta", "estrella", "galàxia", "satèl·lit", "astronauta", "cometa", "meteorit"] },
};
function wordsFor(level, theme) {
  const T = THEMES[theme];
  if (level <= 5) return (T && T[5]) || WORDS5;
  return (T && T[6]) || WORDS6;
}

/* Font d'elements per nivell, sense repeticions immediates */
class Pool {
  constructor(level, o = {}) {
    this.level = level; this.o = o; this.recent = [];
    if (o.items) this.items = o.items.slice();
    else if (level <= 3) this.items = (o.letters && o.letters[level]) || LETTERS[level];
    else if (level === 4) this.items = o.syllables || SYLLABLES;
    else this.items = wordsFor(level, o.theme).map(w => level === 5 ? w.toLocaleLowerCase("ca") : w.toLocaleLowerCase("ca"));
    if (level === 5 && !o.items) { const f = this.items.filter(w => /^[a-zç]+$/.test(w)); this.items = f.length >= 6 ? f : WORDS5.filter(w => /^[a-zç]+$/.test(w)); }
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
const PRAISE = ["Molt bé!", "Fantàstic!", "Genial!", "Així m'agrada!", "Perfecte!", "Bravo!", "Increïble!", "Ho has clavat!"];
