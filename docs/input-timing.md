# Entrada de teclat i aparició d'objectius

Els objectius accepten la resposta des que la seva lletra comença a ser visible, incloent-hi aparicions parcials i transparències. S'han alineat els filtres d'entrada de globus, peixos, fruita, asteroides, avions, talps, portes dels cotxes, blocs de la torre, constel·lacions, notes del concert, penals i serp. Al concert, la finestra d'entrada comença quan la nota apareix i conserva el límit de retard.

Les fases que mostren un model per observar o memoritzar abans del torn de resposta (cova i robot) conserven la seva mecànica. Les animacions de resultat i els objectius ja completats no es reobren. L'escriptura de paraules continua respectant l'ordre de les lletres.

El controlador compartit no penalitza tecles quan no hi ha cap objectiu actiu, ni la repetició automàtica de mantenir una tecla premuda. Durant el «Som-hi!», una resposta vàlida ja pot iniciar la partida.

L'opció «Ajuda i pausa en errors» es troba a les opcions generals i al panell docent. Activada conserva la comparació de lletres i la pausa fins a prémer espai; desactivada no mostra aquesta ajuda ni atura el joc. Els errors reals continuen comptant i es conserven les reaccions pròpies del joc. Les majúscules són el valor predeterminat; una elecció desada de minúscules es conserva.

## Comprovacions

`node tests/input-timing.cjs` comprova:

- Els 25 jocs en els sis nivells, amb respostes immediates i intervals sense objectiu.
- Els globus següents mentre la placa només és parcialment visible, als sis nivells.
- La primera lletra realment dibuixada en deu jocs amb entrada animada: resposta acceptada i puntuació incrementada en aquell mateix fotograma.
- Errors reals, ordre de les paraules, repetició automàtica i represa amb espai.
- Opció d'ajuda activada i desactivada, majúscules per defecte i persistència de preferències.

La prova utilitza Chromium; no equival a una comprovació manual en tots els dispositius.
