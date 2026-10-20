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

## Crèdits i llicències de tercers

- Tipografies Andika i Nunito: SIL Open Font License 1.1.
- Freqüència de les lletres: corpus AnCora (Taulé, Martí i Recasens, 2008), versió Universal Dependencies, CC BY 4.0.
- Veu Piper Ona (es descarrega des de l'app): dades de la UPC (Festcat), CC BY-SA 3.0 ES.
- Sons de les lletres: locucions de LECAA Docs (veu de l'Anna).
