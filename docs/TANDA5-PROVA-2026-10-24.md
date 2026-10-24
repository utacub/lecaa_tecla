# Tanda 5: prova dels jocs 18–22

Base publicada: d60fd7928954573d44509fb65fb193f332ed68a2. Branca de disseny `art/tanda5-prova`; no es publica aquesta tanda.

## Referències aprovades

- Torre de control: libfile_76fbc1c981348191aae4c46e003c47fb.
- Talps del teclat: libfile_9beeca4f81f4819190754fc823aea744.
- L’eco de la cova: libfile_0144d4938d2c8191ab186fbdeed5d386.
- La granja amagada: libfile_ebb60457edf88191926746b3da2bf065.
- Penals de lletres: libfile_3213033047ac8191882385779712fd94.

Tretze recursos WebP derivats amb imagegen de les cinc maquetes: sis decorats i set atles transparents. Textos i controls es dibuixen amb Canvas. Els retalls es calculen individualment per component alfa; els animals de la granja incorporen un contorn de retall Canvas per evitar restes dels veïns de l’atles. No s’alteren els fitxers font generats.

## Canvis

- Aeroport en miniatura, cinc avions de colors, pista i aparcaments ajustats al decorat. Separació dels cartells propers i línia de connexió amb l’avió quan cal.
- Prat tèxtil, tres expressions del talp i forats que mantenen la distribució del teclat.
- Cova violeta amb cristalls independents, il·luminació de colors i seqüència de memòria original.
- Granja de llapis de cera, quatre portes animades i vint animals. Es manté ocupada l’activitat fins que l’animal arriba al quadern: escriure ràpid ja no substitueix l’animal en trànsit.
- Estadi nocturn, dues perspectives, guineu protagonista i sis equips amb jugador i porter. Es conserven trajectòries, torns, marcador i dificultat. Les figures raster es traslladen, giren i salten; les extremitats no tenen animació independent en aquesta prova.

## Validació

`node qa/render-tanda5.cjs`: 30/30 partides automàtiques completades (5 activitats × 6 nivells). Repetits els sis nivells de l’aeroport després de separar cartells. `node qa/atlas-tanda5.cjs`: contacte de tots els animals i jugadors, revisat sobre blanc. Revisió visual Canvas dels cinc jocs als nivells 1 i 6, incloent les dues perspectives dels penals. Comprovació de sintaxi dels scripts i compilació HTML autònoma.

Aquestes proves simulen rellotge i tecles; no són proves en navegador real, àudio ni dispositiu tàctil. Cal revisar aquestes condicions abans de publicar.

## Reproducció de la prova

1. `node qa/render-tanda5.cjs`
2. `GAMES=19,22 LEVELS=1,6 ONLY_SNAPSHOT=1 SNAPSHOT_FRAME=90 node qa/render-tanda5.cjs`
3. `python3 tools/preview-tanda5.py /ruta/LECAA_Tecla_cinc_redissenys_18_22_prova.html`

La còpia conserva els 25 jocs i incorpora un selector inicial dels cinc nous amb els sis nivells. `dist/pwa` i la branca publicada no es modifiquen.
