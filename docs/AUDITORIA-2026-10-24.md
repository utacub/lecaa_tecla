# Auditoria i optimització · 24 d'octubre de 2026

Punt de partida: `main` a `609ca14`. Proves fetes amb Chromium 153 sense interfície (renderitzat per programari), a 1600 × 900.

## Proves

- Portada, «Qui juga?», illa, viatge, museu, accés docent, Blanc sobre negre i els 25 minijocs als nivells 1, 3 i 6 (82 pantalles), cada una 5 s amb joc automàtic: cap error de JavaScript ni de consola.
- `tools/qa-release.cjs`: actualització des de la versió publicada anterior, dades de les altres apps del domini intactes, funcionament sense connexió i els 25 jocs: superada (`docs/qa/release-pwa.json`).
- Regles del projecte revisades al codi: menús i illa amb ratolí, codi docent propi amb «No recordo el codi», PWA amb `id`/`start_url`/`scope` `/lecaa_tecla/`, memòries amb prefix `lecaa-tecla-` (CacheStorage, localStorage i IndexedDB).

## Canvis (sense efecte en el funcionament ni en la imatge)

| Canvi | Efecte | Comprovació |
|---|---|---|
| Les 8 il·lustracions WebP sense pèrdua es tornen a comprimir sense pèrdua amb l'esforç màxim (`exact`) | −175 KB | píxels RGBA idèntics |
| El logo de la UTAC, que és el mateix fitxer que el primer logo dels crèdits, s'incrusta una sola vegada | −41 KB | píxels idèntics |
| El service worker desa només `./` i respon `index.html` amb aquesta còpia | la instal·lació baixa i desa l'HTML (≈ 60 MB) una vegada menys | prova d'actualització i fora de línia, també obrint `index.html` |
| Es treu `assets/sons/anna/`, que ja no entrava al muntatge: els 32 fitxers són idèntics byte a byte a `assets/sons/phonemes/` | repositori més net | comparació MD5 |

Abans i després: 263 empremtes (totes les imatges descodificades, logos, banc i àudios de fonemes) idèntiques, i captures de portada, crèdits i illa idèntiques píxel a píxel.

## Observacions que no s'han canviat

- L'HTML fa ≈ 60 MB perquè incrusta 197 il·lustracions (43 MB en WebP, un terç més en base64). Per reduir-lo de debò caldria recomprimir amb pèrdua o servir les imatges com a fitxers a la PWA, i això canvia la qualitat o l'arquitectura: queda com a decisió pendent.
- A l'arrencada es descodifiquen totes les imatges (arrencada ≈ 3,7 s i 176 MB de memòria JS en aquesta màquina).
- El terra de parquet del museu mostra les juntures de la textura cada 512 px.
- El museu i l'illa són les pantalles més costoses de dibuixar en renderitzat per programari; el perfil mostra que el temps és de rasteritzat del llenç, no de JavaScript, i amb acceleració gràfica hauria de ser molt menor.
