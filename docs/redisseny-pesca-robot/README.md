# Redisseny de pesca i robot — 24 d’octubre de 2026

Versió de prova basada en les dues maquetes aprovades. No publicada.

## Pesca

Escenaris il·lustrats d’estany i cala, barca de fusta amb rem i corda, galleda i vuit pescadors de felpa segons l’animal del perfil. 42 il·lustracions independents de peixos, compartides entre hàbitats quan es repeteix una espècie. El mateix recurs representa cada peix mentre neda, salta i forma part de la col·lecció.

Es generen exactament dotze peixos diferents per partida. El recompte s’incrementa quan el peix arriba a la col·lecció. Després de l’última captura, l’aquari s’amplia amb els dotze exemplars i els seus noms. Es manté obert fins al Retorn o el clic a Continua. El moviment reduït evita el zoom i el moviment decoratiu dels peixos de l’aquari.

## Robot

Teatre de vellut granat, llautó, altaveus de fusta i pista lluminosa. Safata de passos de color crema amb contorn daurat i etiquetes de rol. El cos, el cap, les articulacions, les dotze animacions, el so, els reptes i el ball lliure es conserven. Les frases llargues es distribueixen en dues files quan cal.

## Validació

`NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" node qa/check-pesca-robot.cjs`

Simulació amb el motor real i Canvas natiu: completes les dotze combinacions de joc i nivell; dotze espècies úniques als sis nivells de pesca; espera de quinze segons a l’aquari sense final automàtic; final únic després de Retorn. Captures dels sis nivells i del ball lliure. Comprovacions addicionals amb moviment reduït. Revisió visual de les captures. No s’ha pogut executar una comprovació en navegador en aquest entorn: les proves automatitzades utilitzen Canvas natiu.

## Construcció

`python3 tools/preview-pesca-robot.py /ruta/LECAA_Tecla_pesca_robot_prova.html`

La previsualització inclou els 25 jocs, un selector inicial dels dos redissenyats i nivells de l’1 al 6. Les imatges i fonts estan incrustades; la veu segueix la configuració existent del navegador.

La distribució publicada no es modifica en aquest lliurament. Aquest paquet conté fonts i recursos; es pot construir la distribució general amb `python3 tools/build.py /ruta/LECAA-Tecla.html`.

## Correcció de la immersió dels peixos

Els peixos es creen dins d’uns límits d’aigua per carril que reserven espai per a tota la silueta i la placa. Apareixen gradualment durant 1,1 segons, sense trajecte des de fora de pantalla, i comencen a nedar després de completar l’aparició. La selecció per teclat espera que siguin visibles. Les il·lustracions submergides utilitzen una còpia suavitzada en memòria cau, tenyida de turquesa i amb menor opacitat; els salts i l’aquari conserven la nitidesa. Comprovació dels sis nivells i dels límits de les siluetes a cada fotograma de la simulació; comprovacions addicionals dels nivells 1 i 6 amb moviment reduït.
