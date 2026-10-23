# Tanda 3 — còpia de prova

Redisseny visual de Cara boja (6), Talla fruita (8), Jardí de lletres (9), Globus amunt (11) i El tren de paraules (12). Cinc escenes, peces independents, fons estacionals i paisatge de viatge. Els recursos font són a references/tanda3; els optimitzats, a assets/art. No s'ha actualitzat dist ni publicat a Pages.

Compilació: `python tools/build.py /ruta/prova.html`.
Selector de revisió: primer `node qa/render-tanda3.cjs` (requereix @napi-rs/canvas), després `python tools/preview-tanda3.py /ruta/prova.html`.

Validació: 30 sessions simulades, cinc activitats per sis nivells, arriben al final. Captures revisades amb el motor canvas de Node. Les simulacions invoquen la lògica del joc amb entrades correctes i simulen l'àudio; no equivalen a una prova d'integració en navegador. Pendents de revisió manual en navegador: entrada de teclat, veu/so, rendiment i enquadrament en diferents pantalles.

No s'han canviat intencionadament continguts didàctics, regles de progressió ni motor d'àudio. El selector és exclusiu de la còpia de revisió.

## Correcció dels retalls de Talla fruita

Les caselles regulars de l'atles retallaven síndries i altres peces, i incloïen fragments veïns. `src/art-fruit.js` defineix regions individuals i aïlla el component alfa principal amb marge de suavitzat. La imatge font es conserva i l'extracció es desa en memòria cau. Revisats visualment 15 sprites sencers i 15 interiors; verificats marges transparents amb `node qa/fruit-crops.cjs`. Sis nivells simulats completats després de la correcció (`qa/fruit-fix-results.json`).

## Correcció dels convidats de Globus amunt

Regions individuals per als 12 animals, inclosos orelles, trompa, potes, cues i barrets. L'extractor compartit elimina components veïns sense dividir els personatges segons la quadrícula. Revisió visual dels 12 sprites amb `node qa/guest-crops.cjs`; marges transparents comprovats. Sis nivells simulats completats (`qa/guest-fix-results.json`). Repetida la comprovació dels 30 sprites de fruita després de compartir l'extractor.
