# Art direction (from the approved design docs, Catalan originals summarised)

Principles: three fixed layers: background (texture and ambience, slightly less saturated), game (characters and objects),
letters (always on top, no material filter). Letter plate: plain cream, near-black ink, thin border in the game's colour
and a short crisp shadow; the BORDER may carry the game's material (stitch, crayon stroke), the INTERIOR never.
Letter motion: smooth translation and scale yes; rotation, deformation, motion blur or blinking no. When the child must
answer, the letter is still or slow. Spectacular feedback comes AFTER the answer (explosions, confetti, particles).
No effect flickers more than 3 times per second (WCAG). Characters are 2.5D figures made of layers with soft light and
shadow. Each game's title/feel uses its material (embroidered, cut paper, neon…).

Per game (material family → look):
- 2 Invasors (light/pixel): big-pixel pixel art, 16-colour palette, subtle old-screen effect (scanlines + slight curvature
  vignette) ONLY on background and ships; explosions are pixels scattering with gravity; plates flat and crisp over ships.
- 3 Asteroides (light/neon): neon vector lines (cyan, magenta, yellow) with bloom on black, parallax starfield; fragments
  glow and fade; plates do not rotate with fragments.
- 4 Curses (toy): plastic toy cars on a giant kitchen table, cups, spoons and crumbs as obstacles, gates are cardboard
  arches; boost flame on hit, skid with smoke on miss. Tilt-shift miniature look (depth-of-field blur on far background only).
- 5 Mosaic (ceramic): Modernist trencadís; white ceramic pieces become glazed on hit with specular highlights that move
  with a light; final image can be tilted with arrows to see it shine.
- 6 Cara boja (textile/felt): felt head on a sewing board, pieces sewn with big stitches, each part bounces in on a spring
  with visible thread; replaced parts unstitch and fall into the sewing box. Lively expressions.
- 7 Monstre golafre (plasticine): round expressive blue plasticine monster on plasticine hills; food has faces and falls
  with the plate hanging from a small parachute; monster swells when eating, comic burp; missed food splats.
  Characters animate at 12 fps (stop motion), plates move at 60 fps.
- 8 Talla fruita (gouache): glossy juicy gouache fruit on a dark wood table; the cut is a stroke of white light; halves
  with painted interiors (watermelon seeds, orange fibres) fall with physics; splashes that fade.
- 9 Jardí (watercolour): each plant appears as a colour bloom spreading in water then defined by line; sky changes with
  the season; butterflies, birds and squirrels as 2.5D figures arriving.
- 10 Pesca (watercolour): animated water with light caustics on the bottom, sky reflections, ripples when the hook
  touches; the plate is on the dorsal fin above water and never deforms.
- 11 Globus (paper/latex): glossy coloured paper and latex balloons with specular highlight; plate hangs from the string;
  popping releases paper confetti falling with physics; animal guests clap.
- 12 Tren (toy wood): classic wooden toy train, varnished wood, magnets, track pieces; wagons carry the letter on a side
  plate; when it leaves, the camera follows it through a model landscape with bridges and tunnels.
- 13 Torre (toy wood): painted wooden blocks swinging from a toy crane, physics; camera rises with the tower;
  cotton-wool clouds at the top; a well-centred block makes a clean wood "toc".
- 14 Concert (light/neon): night stage, coloured spotlights, felt animal audience in silhouette; lanes are neon tubes,
  each hit pulses light on the beat. Plates have a luminous border, flat bright interior.
- 15 Constel·lacions (paper/cyanotype): everything deep Prussian blue with white strokes like an old star chart; lines
  between stars in shining gold ink; when finished the animal draws itself and walks across the sky.
- 16 Laberint (painting/kraft): aged kraft pirate map with ink and crayons, coffee stains, folds; 2.5D explorer with a
  torch lighting the paper around him; crossroad signs are wooden boards with the letter on a light plate; path walked
  marked with red dotted line.
- 17 Pastisseria (plasticine): pastel plasticine bakery counter; ingredients fall into the bowl and mix with a swirl;
  decoration phase as reward (each letter adds a cherry, candle or cream).
- 18 Torre de control (paper/screenprint): 1960s airport poster screenprint, flat colours with slight misregistration and
  ink grain; planes circle with dotted trails; fuel shown with a small needle gauge.
- 19 Talps (textile/plush): green plush meadow with holes laid out exactly like the real keyboard rows (with the real
  row stagger); moles are plush toys with hard hats and glasses that pop with a soft jump; streaks make the meadow bloom.
- 20 Eco de la cova (light/crystals): crystals with refraction and dynamic light reflected on wet walls; each letter
  lights a crystal of a fixed colour and plays a fixed note, so the sequence is also a melody.
- 21 Granja amagada (painting/crayons): coloured wax crayons on drawing paper, like a very well made child's drawing,
  line "boiling" softly (re-jitter strokes at ~8 fps); barn doors open by redrawing; animals exaggerated entrances.
- 22 Penals (sports trading card / TV broadcast): night stadium with floodlights, striped grass, 2.5D animal players with
  shirts; the scoreboard is an old split-flap board, only for results.
- 23 Robot ballarí (toy tin): vintage coloured tin robot with metal reflections and screws, on a dance floor of light-up
  tiles, mirror ball; each step has its skeletal animation with spring and gear sounds.
- 24 Serp de paraules (textile/cross-stitch): the whole board is cross-stitch fabric with a subtle grid; the snake is
  "embroidered" stitch by stitch as it moves with a needle following; letters are big buttons sewn on the fabric with a
  flat plate in the centre; perle cotton threads with volume and sheen.
- 25 Carter (paper pop-up): pop-up book; the street of small colourful houses rises from the page; postman 2.5D on a
  bike; envelopes fly with a paper curve, the mailbox closes with a clack, the neighbour appears at the window.


## Implemented redesign, 23 October 2026

The current artwork for games 1–5 supersedes the earlier pixel/neon production descriptions above: pop-up paper album, enamel orbital base, crystal exploration, tabletop toy race, and Mediterranean ceramic studio. Games 7, 10 and 23 add clay, watercolour and tin-robot assets. Letters remain separate Canvas text; reduced-motion settings and game mechanics remain in place. Race cars use 16 headings at 22.5-degree intervals. Optimized WebP resources live in assets/art and are embedded by tools/build.py.
