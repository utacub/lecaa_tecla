# LECAA Tecla

Joc lliure per descobrir on viu cada lletra al teclat, a través de 25 minijocs, el viatge inicial a l'illa i l'activitat **Blanc sobre negre**. No és un mètode de mecanografia: l'objectiu és automatitzar la localització de les tecles.

## Com fer-lo servir

- **Fitxer únic:** obre `dist/LECAA-Tecla.html` amb el navegador. Funciona sense connexió.
- **Versió instal·lable (PWA):** la carpeta `dist/pwa/` s'ha de servir per HTTPS; aleshores el navegador permet instal·lar-la.

Els menús i l'illa es fan servir amb el ratolí; dins dels jocs només es juga amb el teclat. L'accés docent (alumnes i resultats) és a la rodeta d'opcions de la portada.

## Estructura

- `src/`: codi (Canvas 2D, sense llibreries). `src/games/gNN.js` és cada minijoc.
- `src/tts.js` i `src/piper-worker.js`: motors de veu (navegador i Piper), portats de LECAA Docs.
- `assets/`: logos, crèdits i locucions dels fonemes (`assets/sons/anna/`).
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
| Freqüència de les lletres: corpus AnCora (Taulé, Martí i Recasens, 2008), versió Universal Dependencies | taula a `src/voyage.js` | CC BY 4.0 | [UD Catalan AnCora](https://github.com/UniversalDependencies/UD_Catalan-AnCora) |
| Locucions dels sons de les lletres (veu de l'Anna) | `assets/sons/anna/` | creades per a LECAA (procedeixen de LECAA Docs) | |

Com que el fonemitzador de les veus Piper inclou espeak-ng (GPL-3.0), les versions que el distribueixen s'han de publicar sota una llicència compatible amb la GPL-3.0; per això LECAA Tecla fa servir la GPL-3.0-or-later, igual que LECAA Docs.

Les veus del navegador (síntesi de parla del sistema) no formen part de l'app: les proporciona el sistema operatiu o el navegador amb les seves pròpies condicions.

### Referència

Taulé, M., Martí, M. A., i Recasens, M. (2008). AnCora: Multilevel annotated corpora for Catalan and Spanish. A *Proceedings of the Sixth International Conference on Language Resources and Evaluation (LREC'08)* (pp. 96–101). European Language Resources Association.
