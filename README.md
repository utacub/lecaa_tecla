# LECAA Tecla

Joc lliure per descobrir on viu cada lletra al teclat, a través de 25 minijocs, el viatge inicial a l'illa i l'activitat **Blanc sobre negre**. No és un mètode de mecanografia: l'objectiu és automatitzar la localització de les tecles.

## Com fer-lo servir

La versió actual es publica a https://utacub.github.io/lecaa_tecla/. El fitxer autònom es pot descarregar a https://utacub.github.io/lecaa_tecla/LECAA-Tecla.html. GitHub Pages genera l’HTML i la PWA des del codi font en cada publicació; aquests HTML i el service worker no es versionen. Els camins `dist/` de sota es creen en executar el muntatge local.


- **Fitxer únic:** obre `dist/LECAA-Tecla.html` amb el navegador. Funciona sense connexió.
- **Versió instal·lable (PWA):** la carpeta `dist/pwa/` s'ha de servir per HTTPS; aleshores el navegador permet instal·lar-la.

Els menús i l'illa es fan servir amb el ratolí; dins dels jocs només es juga amb el teclat. L'accés docent (alumnes i resultats) és a la rodeta d'opcions de la portada i de l'illa. El primer cop es demana crear un codi de 4 xifres, que es pot canviar des de dins; si s'oblida, «No recordo el codi» permet crear-ne un de nou resolent una multiplicació de dos nombres de dues xifres.

## Idiomes

L'app està disponible en els mateixos sis idiomes que els jocs de Mira i Juga: català, castellà, basc, gallec, anglès i francès. L'idioma es tria amb el menú de la part superior dreta de la portada o des de la rodeta d'opcions; la primera vegada se segueix l'idioma del navegador, i qui ja feia servir l'app abans continua en català. Canviar d'idioma no canvia l'estructura ni el funcionament dels jocs: només els textos, les llistes de lletres i paraules, l'ordre de freqüència de les lletres, el teclat dibuixat (AZERTY per al francès, QWERTY britànic per a l'anglès) i les veus.

- **Sons de les lletres:** en català i en castellà, locucions enregistrades (veu de l'Anna, de LECAA Docs i LECAA Cast). En la resta d'idiomes la veu sintètica diu el nom de la lletra.
- **Veus:** les del sistema o del navegador en tots els idiomes; a més, veus Piper descarregables en català (Ona), castellà (Davefx, Sharvard) i basc (Maider, Antton). En gallec no hi ha cap veu lliure per al navegador: el menú de veus ho explica, recomana les veus gallegues de Microsoft Edge i ofereix com a alternativa una veu castellana o la portuguesa Tugão.
- **Traduccions:** `src/lang/xx.js` (diccionari `I18N.xx` amb el text català com a clau, i continguts propis a `LANG_DATA.xx`). Estan fetes amb Claude i convé que les revisin parlants nadius.
- **Proves:** `node tests/i18n-screens.cjs dist/index.html <carpeta> es,eu 1-25 1,6` fa captures de les pantalles i de cada joc i recull els errors.

## Estructura

- `src/`: codi (Canvas 2D, sense llibreries). `src/games/gNN.js` és cada minijoc.
- `src/tts.js` i `src/piper-worker.js`: motors de veu (navegador i Piper), portats de LECAA Docs.
- `assets/`: logos, crèdits, il·lustracions (`assets/art/`) i locucions dels fonemes (`assets/sons/phonemes/`, vegeu `docs/phonemes.md`).
- `tools/`: muntatge i captures.
- `docs/`: disseny de les activitats (`SPEC.md`), direcció d'art (`ART.md`) i API del motor (`ENGINE.md`).

## Muntatge

```sh
python3 tools/build.py dist/LECAA-Tecla.html   # fitxer únic
python3 tools/pwa.py                           # versió PWA a dist/pwa/
```

## Llicència

LECAA Tecla és programari lliure: es distribueix amb la llicència **GNU General Public License 3.0 o posterior** (GPL-3.0-or-later), que és al fitxer `LICENSE`. Es pot fer servir, estudiar, modificar i redistribuir; les versions modificades que es distribueixin s'han de publicar amb la mateixa llicència i amb el codi font.

La llicència cobreix el codi. **No** cobreix els logotips de la UTAC, de LECAA ni de les institucions (Universitat de Barcelona, Fundació Bosch i Gimpera i Generalitat de Catalunya), que són marques dels seus titulars i no es poden fer servir sense el seu permís, ni les locucions i les tipografies, que conserven les condicions indicades a continuació.

## Llicències de tercers

| Component | On és | Llicència | Text |
|---|---|---|---|
| Tipografia Andika (SIL Global) | incrustada a l'app | SIL Open Font License 1.1 | `LICENSES/OFL-1.1-Andika.txt` |
| Tipografia Nunito (The Nunito Project Authors) | incrustada a l'app | SIL Open Font License 1.1 | `LICENSES/OFL-1.1-Nunito.txt` |
| ONNX Runtime Web 1.18.0 (Microsoft) | dins `src/piper-worker.js`; el fitxer `.wasm` es baixa en descarregar la veu | MIT | `LICENSES/MIT-onnxruntime-web.txt` |
| piper-wasm 1.0.0 (Diffusion Studio) | dins `src/piper-worker.js`; els fitxers `piper_phonemize.wasm` i `.data` es baixen en descarregar la veu | MIT | `LICENSES/MIT-piper-wasm.txt` |
| piper-phonemize (Michael Hansen) | dins del fonemitzador que es baixa | MIT | `LICENSES/MIT-piper-phonemize.txt` |
| espeak-ng | dins del fonemitzador que es baixa | GPL-3.0-or-later | `LICENSE` |
| Veu Piper Ona (UPC, Festcat) | no s'inclou: es baixa des de Hugging Face quan l'usuari ho demana | CC BY-SA 3.0 ES | [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/ca/ca_ES) |
| Veus Piper Davefx (castellà) i Tugão (portuguès, alternativa per al gallec) | no s'inclouen: es baixen quan l'usuari ho demana | CC0 | [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices) |
| Veu Piper Sharvard (castellà; Universitat d'Edimburg) | no s'inclou: es baixa quan l'usuari ho demana | CC BY 3.0 | [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/sharvard) |
| Veus Piper Maider i Antton (basc; itzune) | no s'inclouen: es baixen quan l'usuari ho demana | CC BY 4.0 | [rhasspy/piper-voices](https://huggingface.co/rhasspy/piper-voices/tree/main/eu/eu_ES) |
| Freqüència de les lletres: corpus AnCora (Taulé, Martí i Recasens, 2008), versió Universal Dependencies | taula a `src/voyage.js` | CC BY 4.0 | [UD Catalan AnCora](https://github.com/UniversalDependencies/UD_Catalan-AnCora) |
| Freqüència de les lletres en castellà: UD Spanish AnCora | `src/lang/es.js` | CC BY 4.0 | [UD Spanish AnCora](https://github.com/UniversalDependencies/UD_Spanish-AnCora) |
| Freqüència de les lletres en basc i gallec: UD Basque BDT i UD Galician CTG | `src/lang/eu.js`, `src/lang/gl.js` (només la taula de percentatges) | CC BY-NC-SA 3.0 | [UD Basque BDT](https://github.com/UniversalDependencies/UD_Basque-BDT), [UD Galician CTG](https://github.com/UniversalDependencies/UD_Galician-CTG) |
| Freqüència de les lletres en anglès i francès: UD English EWT i UD French GSD | `src/lang/en.js`, `src/lang/fr.js` | CC BY-SA 4.0 | [UD English EWT](https://github.com/UniversalDependencies/UD_English-EWT), [UD French GSD](https://github.com/UniversalDependencies/UD_French-GSD) |
| Locucions dels sons de les lletres (veus de l'Anna i en Jordi; veu femenina de LECAA CAST) | `assets/sons/phonemes/` | creades per a LECAA (procedeixen de LECAA i LECAA CAST; vegeu `docs/phonemes.md`) | |

Com que el fonemitzador de les veus Piper inclou espeak-ng (GPL-3.0), les versions que el distribueixen s'han de publicar sota una llicència compatible amb la GPL-3.0; per això LECAA Tecla fa servir la GPL-3.0-or-later, igual que LECAA Docs.

Les veus del navegador (síntesi de parla del sistema) no formen part de l'app: les proporciona el sistema operatiu o el navegador amb les seves pròpies condicions.

### Referència

Taulé, M., Martí, M. A., i Recasens, M. (2008). AnCora: Multilevel annotated corpora for Catalan and Spanish. A *Proceedings of the Sixth International Conference on Language Resources and Evaluation (LREC'08)* (pp. 96–101). European Language Resources Association.


## Actualització artística del 23 d’octubre de 2026

Integrats els redissenys d’Àlbum de cromos, Invasors, Asteroides, Curses i Mosaic, i les millores de Monstre golafre, Pesca a l’estany i Robot ballarí. Inclou decorats i objectes independents, animacions, miniatures, timbres musicals i mescla amb atenuació de música durant les locucions. Els cotxes disposen de 16 orientacions cada 22,5 graus. Els recursos de joc s’incrusten a l’HTML i també formen part de la PWA.

Per generar les icones, `tools/icons.js` requereix Playwright i un navegador Chromium. Es pot indicar-ne l’executable amb `LECAA_CHROMIUM`. Les proves tècniques són als scripts `tools/qa-*.cjs`; els límits de validació consten a `docs/RELEASE-2026-10-23.md`.
