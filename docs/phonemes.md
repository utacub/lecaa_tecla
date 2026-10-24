# Bancs de fonemes de LECAA i LECAA CAST

Importació dels enregistraments aïllats actius de les versions publicades:

- Català: `utacub/lecaa`, commit `65280eb2aac3eefd232dec331d6415ac150dac69`, `AUDIO_BANK` i `ISOLATED_PHONEME_BLOCKS`: 32 sons amb cadascuna de les dues veus (anna i jordi).
- Castellà: `utacub/lecaa_cast`, commit `0bab868b54639c1ceecb36c985c96d691678ca4e`, les 23 entrades actives `phoneme.*` de `CAST_AUDIO`, veu femenina aprovada. No s'importen els candidats rebutjats de `preservedSources`.

87 enregistraments referenciats, 67 fitxers diferents. Els bytes originals es conserven sense transcodificació, retalls ni canvis de velocitat o volum. La deduplicació és per SHA-256. `assets/sons/phonemes/manifest.json` conserva l'idioma, la veu, els símbols, els intervals originals de reproducció, la procedència i els hashes.

Aquest recompte correspon als recursos de les aplicacions font, no a una afirmació sobre l'inventari fonològic complet de cada llengua. La validació tècnica no substitueix la revisió fonètica dels enregistraments, que es manté tal com figura a les aplicacions font.

## Ús

- `Phon.play(lletra, 'ca')`: català, veu anna per defecte.
- `Phon.play(lletra, 'es')`: correspondències grafema-so de LECAA CAST, veu femenina.
- `Phon.playPhoneme('θ', 'es')`: selecció explícita per símbol fonètic.
- `Phon.playPhoneme('ɲ', 'ca', 'jordi')`: veu catalana alternativa.
- `Phon.stop()`: atura l'àudio i el temporitzador.

No hi ha substitució automàtica entre idiomes o veus quan manca una locució. La selecció per símbol fonètic està separada de la selecció per lletra per evitar ambigüitats, com la lletra catalana «j» i el símbol /j/.

Blanc sobre negre segueix utilitzant explícitament `ca`. Aquesta importació no tradueix la interfície, no modifica la freqüència de les lletres i no habilita encara una activitat castellana. Els 23 sons castellans són accessibles per símbol; les correspondències de lletres es conserven segons LECAA CAST i cal revisar-ne la cobertura quan s'adapti l'activitat.

## Reproducció de la importació i comprovació

```sh
python tools/import_phonemes.py /ruta/checkout-lecaa /ruta/checkout-lecaa-cast
python tools/build.py dist/LECAA-Tecla.html
node tests/phonemes.cjs
```

Els checkouts font han d'estar fixats als commits indicats per reproduir exactament aquesta importació. La prova comprova hashes, descodificació dels 67 fitxers, intervals dels 87 enregistraments, separació d'idiomes, absència de fallback i inici/aturada de la reproducció al navegador.
