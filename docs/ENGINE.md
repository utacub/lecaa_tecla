# LECAA Tecla: engine guide for game authors

Single self-contained HTML, Canvas 2D, no libraries, classic scripts concatenated by `tools/build.py`
in this order: core, textures, critters (if present), audio, content, ui, play, avatars, scenes, games/g*.js, main.
Logical canvas is **1600×900** (`W`, `H`); the engine scales it to the window and handles devicePixelRatio.
Everything the user reads is **Catalan**.

## Hard art rules (non-negotiable)
- A target letter/syllable/word is ALWAYS drawn with `drawPlate()` (cream plate, Andika bold, near-black ink),
  or, if a game needs the letter integrated in a custom object (a card, a tile), cream/white background + `BRAND.ink`
  text in `FONT_L` weight 700. Never rotate, skew, blur, texture, outline-glow-on-glyph or animate-scale-distort the letter.
  Objects may rotate, but the plate stays upright (draw it after `ctx.restore()`).
- Minimum size: 64 px font for single letters, 40 px for syllables/words (logical px). Contrast ≥ 7:1.
- Texture never touches the letter. No flashing (photosensitivity): no full-screen white flashes.
- Use `disp(str)` for any displayed target (respects the uppercase setting). `drawPlate` already does it.
- Very high production quality: rich backgrounds, depth (2.5D: drop shadows, layers, parallax), material per game,
  juicy but calm animation (ease curves, squash & stretch, particles). Look at `src/games/g01.js` as the reference.

## Registering a game (one file per game: `src/games/gNN.js`, wrap everything in an IIFE)
```js
(() => {
  Games.register({
    id: 7, key: "g", name: "El monstre golafre", zone: "camp", music: "marimba",
    collect: { one: "barret", many: "barrets" },        // collectible noun (museum + end card)
    goal: level => "Escriu la lletra de cada aliment…",  // one or two Catalan sentences, depends on level
    thumb(ctx, x, y, w, h, t) { … },  // miniature illustration filling the rect (island token, place card, museum). Must work at 132×132 and 460×250. Animated with t.
    create(api) { return { update(dt), draw(ctx), onKey(k), expected() , start?() }; },
    // optional: hud:false (draw your own HUD via drawHUD(ctx)), kbPos:[x,y] (on-screen keyboard centre, default [800,768]),
    // missAt:[x,y] (centre of the error comparison box), ownCompare:true (game draws its own comparison; keyboard still shown),
    // keyboard:false (never show the on-screen keyboard: e.g. the moles game IS a keyboard), hints:false,
    // demoTime: seconds of autoplay demo (default 9), captionY (y of the voice subtitle bubble, default 122), updateAtEnd
  });
})();
```
Fixed table (id → key letter, zone, suggested music):
2 i espai chip · 3 a espai synth · 4 c poble rock · 5 m muntanya guitar · 6 b costa waltz · 7 g camp marimba ·
8 f costa perc · 9 j camp harp · 10 p costa guitar · 11 u costa party · 12 t camp ragtime · 13 n costa build ·
14 d muntanya (own song) · 15 e muntanya celesta · 16 l muntanya adventure · 17 s poble jazz · 18 r poble swing ·
19 h camp band · 20 z muntanya cave · 21 v camp country · 22 k poble stadium · 23 w espai funk · 24 x camp musicbox · 25 ç poble waltz

## The game instance returned by create(api)
- `update(dt)`: dt in seconds. Not called while the engine freezes after an error (0.5 s), during pause, countdown.
- `draw(ctx)`: draw the whole 1600×900 scene every frame (the engine draws HUD, keyboard, captions, overlays on top).
- `onKey(k)`: `k` is a lowercased character ("a", "ç", "à", "·", " ") or a key name ("Enter", "Backspace", "ArrowLeft"…).
  Esc is handled by the engine (pause). Dead keys are already resolved (` + a arrives as "à").
- `expected()`: the single next key the child should press right now (a character, or "Enter"), or null when no input
  is expected (e.g. during an animation). Used by: the autoplay demo (it presses expected() every ~1 s), hints
  (key lights up after 5 s idle at levels 1-2, its row at 3-4), and the test harness. **Must be correct**.
- `start()` optional: called at "Som-hi!".

## api
- `api.level` 1..6 (1 vowels, 2 frequent consonants s l r n t m p c d, 3 all letters, 4 syllables, 5 short words, 6 long words with accents/l·l/phrases with spaces)
- `api.demo` true while the autoplay demo runs (the instance is thrown away after it).
- `api.pool({theme, items, filter})` → `Pool` with `.next(exclude=[])` (no immediate repeats, separates confusable
  letters at level 3) and `.many(n, exclude)` (distinct items, distinct first letters when possible). Themes in content.js:
  animals, granja, menjar, fruita, peixos, ingredients, ciutats, noms, cos, natura, festa, tren, musica, passos, espai.
  Levels 1-3 give single letters, 4 syllables, 5 short words (no accents), 6 long words/phrases.
- `api.typer({targets: () => array, rank: t => number (lower = preferred), onDone(t), onStep?(t,k), onLock?(t), onMiss?(t,k), only?})`
  → `Typer` for "type the text of one of several on-screen targets". Targets are your objects with `.text` (lowercase
  string), engine sets `.typed` (chars done), `.locked`, `.done`; set `.dead = true` to remove. First key picks the best
  matching target (by rank), then the rest of its text must follow. Calls api.hit/api.miss itself. Use
  `typer.key(k)` in onKey and `typer.expected()` in expected(). Draw progress with `drawPlate(ctx, t.text, x, y, {progress: t.typed, state: t.locked ? "active" : null})`.
- `api.hit(o)` count a correct keystroke (plays "hit" unless `{sfx:"name"}` or `{sfx:false}`).
- `api.miss(expected, pressed, o)` count an error: freezes 0.5 s, shows the comparison plates + on-screen keyboard
  marking both keys, plays "miss" (or `o.sfx`). `o.at = [x,y]` to place the comparison box.
- `api.say(text)`, `api.sayItem(item, "On és la lletra {x}?")` (letter names are spoken properly), `api.clearCaption()`.
- `api.hud.progress = [value, max]`, `api.hud.timer = seconds`, `api.hud.lives = [n, max]`, `api.hud.score`, `api.hud.label`.
- `api.speed` adaptive multiplier 0.6..1.5 (≥90% accuracy speeds up, <70% slows). Multiply your spawn rates / velocities.
- `api.finish(success, {collectName})` ends the game → end card with stars (1 = done, 2 = ≥80%, 3 = ≥95%).
- `api.particles.emit(x, y, {count, color: [..], speed, gravity, size, life, shape: "circle"|"rect"|"square"|"star"|"spark"|"confetti", glow, angle, spread, drag})` drawn above your scene.
- `api.shake(px)`, `api.t` (play time), `api.idle`.

## Helpers available (globals)
core.js: `W H BRAND FONT_L FONT_T clamp lerp rand randi pick shuffle dist mulberry32 Ease.* hexToRgb rgba shade(hex,±amt) mix(h1,h2,t)
rr(ctx,x,y,w,h,r) starPath blobPath(ctx,x,y,r,seed,wob,n) text(ctx,s,x,y,{size,weight,font,color,align,base,stroke,lw,shadow}) measure Tween wait Particles Sprites`
textures.js: `Tex.paper/wood/felt/clay/stars/nebula/kraft/aida/grain(…)` (cached offscreen canvases, use with createPattern or drawImage),
`Sprites.get(key, w, h, drawFn)` (cache static art, 2× supersampled) + `Sprites.draw(ctx, sprite, x, y, {s, rot, alpha, ax, ay})`,
`Mat.paperCut/crayon/watercolor/clay/felt(ctx, pathFn, color, opts)`, `Mat.glaze`, `Mat.texFill`, `drawGrainOverlay(ctx, amt)`, `drawVignette(ctx, amt, "r,g,b")`, `makeNoise(seed)` (value noise n(x,y) and n.fbm(x,y,oct)).
These Mat functions use shadows/patterns: **prerender static art with Sprites.get** instead of calling them every frame for many objects.
ui.js: `drawPlate(ctx, str, x, y, {size, progress, state: "active"|"hint"|"ok"|"wrong"|"bad", scale, alpha, glow, shadow})` returns {w,h};
`plateSize(ctx,str,size)`, `drawKeycap(ctx,x,y,w,h,label,{theme:"white"|"menta"|"petroli"|"tinta"|"coral"|"gold"|"soft", pressed, size, font})`,
`Kb.draw(ctx, cx, cy, keySize, {marks:{a:"expected"|"wrong"|"hint"}, hintRow, dimOthers})`, `Kb.keyCenter(cx,cy,ks,key)`, `KB_ROWS`, `KB_POS`,
`drawPanel`, `drawStar`, `drawHeart`, `drawChip`, `UI.coral/ok/gold`.
critters.js (shared animal illustrations): `Critters.list [{id,name,theme}]`, `Critters.byTheme("granja"|"mar"|"selva"|"insectes"|"bosc")`,
`Critters.draw(ctx, id, x, y, size, {t, pose:"idle"|"happy"|"jump"|"surprised"|"sad", blink, flip, alpha})`, `Critters.name(id)`. Guard with `typeof Critters !== "undefined"`.
content.js: `LETTERS, SYLLABLES, THEMES, LETTER_NAME, spoken(item), PRAISE, Pool`.
audio.js: `Sfx.play(name, opts)` names: hit miss key tick go count iris whoosh plof pop boing clack wood glass chime{note} bell{note}
laser boom thud cut splash bite burp sprout click0 engine whistle crowd star win page note{note,type,d} sour{note} bike gear.
`Music.STYLES` names (set via def.music). `NOTE(midi)`, `tone({f,f2,d,type,v,delay,verb,lp})`, `noise({f,f2,d,v,ft,q})` for custom sounds.

## Build & test
- Build only your games: `ONLY=7,8 python3 tools/build.py dist/yourname.html` (use your own output file name!).
- Screenshot: `node tools/shot.js dist/yourname.html "play=7&lvl=1&voice=0" out.png 3 "wait:1,a,b"`
  hash params: `play=<id>` `lvl=<1-6>` `demo=1` (start in the demo) `auto=1&acc=0.9&every=350` (autoplay through expected())
  `scene=island&focus=<id>`. Prints console errors or "cap error". Keys: comma separated Playwright key names, `space`, `wait:<s>`.
- Open the PNG with the Read tool and judge it critically. Test every level band (1, 3, 4, 5, 6), an error, the end card
  (`auto=1&every=150` and wait), and the thumb on the island (`scene=island&focus=<id>`).
