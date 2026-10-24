# Cinc activitats més — prova del 24/10/2026

Primera adaptació jugable de les maquetes originals, en una branca de prova. No modifica la publicació de GitHub Pages.

## Referències originals
- 13 — Torre fins als núvols: libfile_3584ea53d6948191b17fa19439527b2c
- 14 — Concert de tecles al teatre: libfile_04e77f69fafc81918988debc8d1113ff
- 15 — Constel·lacions de lletres a l’antic observatori: libfile_57e60726f0f48191a9d443903968a75a
- 16 — El laberint del tresor artesanal: libfile_a155e6983f608191baf69c57622f4c41
- 17 — La pastisseria de l’ovella: libfile_b84816812c34819182b85ef7f7739ee0

## Canvis
Decorats derivats de les maquetes originals amb capes independents: blocs i grua de fusta, teatre de vellut, observatori de llautó, mapa amb explorador i fites de diorama, pastisseria amb ovella i ingredients. Els textos i les tecles continuen renderitzats pel motor. Es mantenen les mecàniques i els sis nivells. S’ajusten les coordenades del mapa, del cel i del forn al nou decorat.

## Validació
30 sessions simulades completades (cinc jocs, sis nivells), renderitzades amb Canvas2D en Node; resultat a qa/tanda4-results.json. Revisió visual de captures de joc. Sintaxi JavaScript validada. L’àudio queda simulat en aquestes proves: no acrediten la reproducció de so ni el rendiment en dispositius reals. Falta una prova manual en navegadors i tauletes abans de publicar.

## Reproducció
NODE_PATH amb @napi-rs/canvas disponible: node qa/render-tanda4.cjs.
Després: python3 tools/preview-tanda4.py /ruta/LECAA_Tecla_cinc_redissenys_13_17_prova.html.
La còpia HTML incorpora un selector de les cinc activitats i els sis nivells.

## Final de la torre
Després de completar-la, la teulada aterra durant 0,8 s; la càmera fa zoom de sortida durant 2,2 s i manté el pla general 2 s. La puntuació apareix als 5 s. Amb moviment reduït, el canvi de pla és directe. Sis nivells completats i demora verificada amb qa/tower-finale.cjs; resultats a qa/tower-finale-results.json.

## Contrast dels ingredients
Cada ingredient de la pastisseria incorpora una targeta blanca opaca amb cantonades arrodonides, contorn discret i marge interior. La mateixa targeta acompanya els ingredients a les opcions, a la comanda i durant el moviment cap al bol.

## Disposició de la pastisseria
Opcions en una graella fixa de tres columnes i dues files. Imatge i tecla o paraula agrupades en una única targeta, dibuixada per sobre del taulell; eliminat el moviment independent que separava etiqueta i ingredient. Globus de comanda amb superfície contínua, títol, cua cap a l’ovella i quatre posicions per als ingredients. Les marques de completat queden en una cantonada sense tapar la imatge. Bol desplaçat per no superposar-se a les opcions. Retalls afinats de cinc ingredients. Revisió visual inicial dels nivells 1 i 6 i simulació dels sis nivells.

## Revisió completa dels retalls
Substituït l’atles d’ingredients per una versió editada amb l’eina integrada ImageGen a partir de l’atles anterior. Consigna: conservar els vint ingredients i l’estil artesanal, amb objectes complets, separats, fons transparent i sense fragments veïns. Els límits s’han calculat per objecte complet a partir del canal alfa, no per cel·les fixes; s’inclouen els fragments de xocolata propis. WebP sense pèrdua per conservar les vores. Recurs: assets/art/bakery-ingredients.webp; límits: src/art-tanda4.js.
Revisió visual dels vint ingredients amb qa/bakery-atlas.cjs sobre blanc: sense fragments aliens ni parts escapçades observades. Proves simulades dels sis nivells de pastisseria.
