
# LECAA Tecla: disseny detallat de les 25 activitats

 · 

## Com llegir les fitxes

Cada activitat té una fitxa amb el mateix ordre: concepte, pantalla, com es juga, objectiu, nivells, aspecte, animació i so, encert i error, i col·leccionable. Aquest document només descriu el disseny; no s'ha generat ni implementat res.

Aquestes regles valen per a totes les activitats i no es repeteixen a cada fitxa:

Lletra. Placa crema llisa amb tinta gairebé negra, tipografia Andika, contrast mínim 7:1, sense cap textura ni deformació. Mida mínima de 64 px per a una lletra i 40 px per a les paraules.

Nivells. 1 vocals, 2 consonants freqüents, 3 totes les lletres, 4 síl·labes, 5 paraules curtes, 6 paraules llargues i frases.

Estrelles. 1 estrella per completar l'objectiu, 2 per fer-ho amb un 80% d'encerts, 3 per fer-ho amb un 95% d'encerts.

Seqüència. Entrada amb iris, demostració animada (es pot saltar amb l'espai), compte enrere, joc, final amb estrelles i col·leccionable, sortida amb iris.

Error. Mig segon d'aturada, les plaques de la lletra demanada i la premuda una al costat de l'altra, i el teclat en pantalla marcant-les totes dues.

Ajuda. Al nivell 1 i 2, la tecla s'il·lumina al teclat en pantalla si l'alumne triga més de 5 segons; al 3 i 4 s'il·lumina la fila; al 5 i 6, res.

Controls. Només teclat. Esc obre la pausa. L'espai és una tecla de joc als nivells 6 (separa paraules).

Velocitat. S'adapta dins del nivell: accelera amb més del 90% d'encerts i alenteix amb menys del 70%.

## Menú general: l'illa de Tecla

El menú és una illa en diorama de paper retallat, amb capes en parallax i llum segons l'hora del dia. Navegar-hi ja és pràctica: cada lloc té un cartell amb una lletra, i escriure-la hi porta la càmera.

### Pantalla 1: portada

Pantalla: l'illa sencera vista des del mar al capvespre, amb gavines i onades. El títol LECAA Tecla, en lletres de fusta pintada, penja d'un rètol al moll.

Animació i so: les lletres del títol es balancegen suaument. Música acústica (guitarra i glockenspiel) i so de mar.

Interacció: la veu diu “Prem qualsevol tecla per començar”. En prémer-ne una, la càmera vola cap al moll.

### Pantalla 2: qui juga?

Pantalla: una prestatgeria de fusta amb fins a 30 avatars de felpa (animals), cadascun amb el nom de l'alumne en una placa.

Interacció: les fletxes mouen un focus de llum entre avatars; Retorn el tria. També es pot escriure la inicial del nom per saltar-hi. El primer cop, l'alumne tria animal i color i el docent hi escriu el nom.

Animació: l'avatar triat salta de la prestatgeria i es converteix en el personatge que es passeja per l'illa.

### Pantalla 3: l'illa

Pantalla: vista aèria inclinada de les 5 zones: el Poble al centre, el Camp a l'oest, la Costa al sud, la Muntanya al nord i, a dalt de tot, l'observatori amb el coet cap a l'Espai. Els 25 llocs tenen un cartell de fusta amb una lletra clara.

Interacció: escriure la lletra d'un cartell fa caminar l'avatar fins al lloc, i la càmera el segueix. Les fletxes el porten al lloc veí. Retorn entra al joc.

Llocs tancats: coberts de boira de paper que es despega quan s'obren. Al principi n'hi ha 3 d'oberts (On és la lletra?, Talps del teclat i Pesca a l'estany); cada 3 estrelles noves se n'obre un altre.

Targeta del lloc: en arribar-hi, una targeta penja d'una branca o d'un fanal amb el nom del joc, una miniatura animada en bucle, les estrelles de cada nivell i el nivell actual.

### Pantalla 4: el museu

Pantalla: un edifici modernista de la plaça amb sales per col·lecció: cromos, peixos, flors, constel·lacions, retrats de Cara boja, coreografies, pastissos, mosaics.

Interacció: fletxes per passar de sala i d'objecte; Retorn el mostra gran i, si és animat, l'anima.

### Pantalla 5: el docent

Accés: mantenir premuda la tecla Esc 3 segons a la portada i escriure un codi de 4 xifres. Així no es topa amb cap drecera del navegador.

Aspecte: interfície neta d'aplicació, sense el món de l'illa, amb pestanyes per a alumnes, configuració, paraules i resultats. És l'única part on es pot fer servir el ratolí.

## Activitats 1 a 5

### 1. On és la lletra?

Concepte. La veu demana una lletra i l'alumne la busca al teclat, sense pressa. És la porta d'entrada a l'aplicació.

Pantalla: un àlbum de cromos obert sobre una taula de fusta clara, vist des de dalt. A la pàgina esquerra, una graella de 20 forats per a cromos; a la dreta, l'espai on apareix la lletra.

Com es juga: una targeta blanca es despega de la pàgina dreta amb la lletra a 300 px. La veu diu “On és la lletra ema?” o “On és la /m/?”. L'alumne la prem. No hi ha límit de temps.

Objectiu: omplir la pàgina de 20 cromos. Cada pàgina és un tema (animals de granja, del mar, de la selva, insectes…).

Nivells: 1 i 2, lletres soles; 3, totes, amb parelles confusibles separades; 4, la veu diu una síl·laba i apareixen 2 targetes juntes; 5 i 6, la veu diu una paraula i l'alumne l'escriu lletra a lletra, amb cada targeta que s'enganxa a la següent.

Aspecte: paper retallat en 2.5D, amb ombres reals entre la targeta i la pàgina. Cromos il·lustrats amb vora blanca i brillantor de paper estucat.

Animació i so: la targeta s'aixeca fent una petita corba; el cromo vola des d'un sobre i s'enganxa amb un “plof”. Música molt suau de piano.

Encert i error: en encertar, l'animal del cromo fa un gest (el gat s'estira, la granota salta) i diu el seu nom. En fallar, la targeta de la lletra premuda llisca al costat, les dues es superposen translúcides perquè es vegi que no coincideixen i després se separen; la veu repeteix la pregunta.

Col·leccionable: els cromos, que es poden mirar al museu.

### 2. Invasors de l'alfabet

Concepte. Un Space Invaders on les naus i els seus trets són lletres.

Pantalla: fons de nebulosa fosca amb estrelles en 3 capes de parallax. A baix, el canó de l'alumne i 3 escuts. A dalt, files de 4 a 8 naus que baixen en zig-zag.

Com es juga: prémer la lletra d'una nau fa que el canó hi apunti i la destrueixi. Les naus disparen projectils amb una lletra més petita; prémer-la desfa el projectil. Si hi ha dues naus amb la mateixa lletra, s'elimina la més baixa.

Objectiu: netejar 5 onades sense perdre les 3 vides. Una nau que arriba a baix o un projectil que toca el canó treu una vida.

Nivells: 1 a 3, naus amb lletres; 4, naus nodrissa amb síl·labes que s'escriuen senceres; 5 i 6, naus amb paraules i, a l'onada final, una nau gegant amb una frase.

Aspecte: píxel art amb píxels grossos i paleta de 16 colors, amb un efecte subtil de pantalla antiga només al fons i a les naus. Les plaques de lletra van sobre cada nau, planes i nítides.

Animació i so: les naus baten com meduses de píxels. Les explosions són píxels que s'escampen amb gravetat. Música chiptune que s'accelera a mesura que les naus baixen.

Encert i error: en encertar, làser de llum i explosió. En fallar, el canó fa un petit “clic” buit i apareixen les dues plaques a la part inferior.

Col·leccionable: una insígnia de pilot per cada sector de l'espai superat.

### 3. Asteroides de lletres

Concepte. Asteroides amb paraules es trenquen en trossos més petits a mesura que s'escriuen.

Pantalla: fons negre amb camp d'estrelles. La nau de l'alumne, al centre, envoltada d'un escut circular. Els asteroides entren des de les vores en direccions diverses.

Com es juga: escriure la paraula d'un asteroide hi dispara. L'asteroide es parteix en fragments que porten una síl·laba o lletra cadascun, i cal eliminar-los també. Mentre s'escriu una paraula, l'asteroide triat queda marcat amb un cercle.

Objectiu: aguantar 2 minuts amb l'escut encara actiu. Cada impacte el redueix un terç.

Nivells: 1 a 3, asteroides d'una lletra que no es divideixen; 4, síl·labes que es divideixen en lletres; 5 i 6, paraules que es divideixen en síl·labes i després en lletres.

Aspecte: línies vectorials de neó cian, magenta i groc amb bloom, com l'Asteroids original però en alta resolució.

Animació i so: els fragments giren i brillen fins a apagar-se; la placa de lletra de cada fragment no gira, només es desplaça. Synthwave suau de fons.

Encert i error: en encertar, un raig de llum i so de vidre trencat. En fallar, l'escut parpelleja un sol cop (sense fer flaixos) i apareixen les dues plaques.

Col·leccionable: un mineral espacial per partida, que s'exposa en una vitrina del museu.

### 4. Curses de Tecla

Concepte. Una cursa de cotxets de joguina sobre una taula de cuina, on cada lletra encertada és un impuls.

Pantalla: vista zenital lleugerament inclinada, en 3D, d'una taula de cuina amb un circuit marcat amb cinta adhesiva. Gots, culleres, molles i una tassa fan d'obstacles. A dalt, la posició i la volta.

Com es juga: el cotxe avança sol. Sobre el circuit hi ha portes de cartró amb una lletra; escriure-la abans d'arribar-hi dóna un impuls. Cada porta fallada fa derrapar el cotxe. Els 3 rivals tenen una velocitat fixa segons el nivell.

Objectiu: acabar 3 voltes entre els 3 primers. Guanyar dóna la copa d'or.

Nivells: 1 a 3, portes amb lletra; 4, portes amb síl·laba; 5 i 6, dreceres amb una paraula que cal escriure sencera per obrir-les. Cada nivell té un circuit nou: cuina, banyera, jardí, taller, taula d'escola i habitació.

Aspecte: Three.js amb llum física, oclusió ambiental i profunditat de camp lleu, com una foto de maqueta. Cotxes de plàstic brillant amb rascades.

Animació i so: flama d'impuls, fum en derrapar, càmera que segueix el cotxe amb inclinació a les corbes. Música de rock lleuger i motors de joguina.

Encert i error: en encertar, la porta es plega i el cotxe surt disparat. En fallar, derrapatge i les dues plaques al marge de la pantalla.

Col·leccionable: copes i cotxes nous per triar a la següent cursa.

### 5. Mosaic màgic

Concepte. Una graella de rajoles blanques que, lletra a lletra, es converteix en un trencadís de colors.

Pantalla: un banc de trencadís vist de front, amb una graella de rajoles blanques on cada rajola porta una lletra. A sota, una miniatura de la imatge que s'està formant.

Com es juga: la veu diu la lletra que toca i la rajola corresponent s'il·lumina. Escriure-la la fa esmaltar del seu color. L'alumne pot triar l'ordre amb les fletxes si ho prefereix.

Objectiu: completar la imatge (un drac, un ocell, una flor). Sense temps.

Nivells: 1 a 3, graelles de 4 × 4 i 6 × 6 amb lletres; 4, cada fila és una síl·laba; 5 i 6, graelles de 8 × 8 on cada fila és una paraula.

Aspecte: ceràmica esmaltada amb reflex especular que es mou amb una llum. Les juntes de ciment tenen gra. Inspiració modernista.

Animació i so: l'esmalt s'escampa per la rajola com un líquid. En acabar, la llum fa un escombrat de reflexos per tota la imatge. Música de guitarra clàssica i so de ceràmica.

Encert i error: en encertar, la rajola es colora amb un dring. En fallar, la rajola fa una petita esquerda que es repara sola, i apareixen les dues plaques.

Col·leccionable: el mosaic acabat, que es pot inclinar amb les fletxes al museu per veure com brilla.

## Activitats 6 a 10

### 6. Cara boja

Concepte. Un cap de feltre que es vesteix escrivint, sense ratolí.

Pantalla: un tauler de costura amb un cap de feltre en blanc al centre. A la dreta, un retrat model en un marc (mode repte); a l'esquerra, un costurer obert amb les peces disponibles i la seva lletra o paraula.

Com es juga: cada lletra correspon a una part: U ulls, N nas, B boca, O orelles, C cabells, M mostatxo, G galtes, P pigues. Prémer-la posa la part; tornar-la a prémer la canvia pel model següent. En mode lliure no hi ha cap objectiu, i Retorn fa una foto.

Objectiu: en mode repte, reproduir el retrat model. Hi ha 10 retrats per nivell, de més simples a més carregats.

Nivells: 1 a 3, lletres inicials; 4, síl·labes inicials (UL, NA, BO); 5, paraules (ulls, nas, barret); 6, ordres (treu nas, posa ulleres blaves).

Aspecte: feltre i felpa amb fibres i costures visibles; botons, llana i retalls de tela com a peces.

Animació i so: cada peça entra amb un bot de molla i una agulla que fa dos punts de costura. Les parts que surten es descusen i cauen al costurer. Expressions vives (parpelleja, somriu, arrufa el nas). Música de vals d'acordió.

Encert i error: en mode repte, una part correcta fa brillar la mateixa part del model. Una tecla sense part assignada mostra les dues plaques i el model assenyala la peça que falta.

Col·leccionable: les fotos dels retrats, en una galeria del museu.

### 7. El monstre golafre

Concepte. Un monstre de plastilina corre a menjar-se els aliments que cauen del cel.

Pantalla: un paisatge de turons de plastilina amb el monstre a terra. Els aliments cauen des de dalt, amb un petit paracaïgudes que porta la placa de lletra. A dalt, la panxa del monstre fa de comptador.

Com es juga: escriure la lletra d'un aliment fa que el monstre hi corri i salti a menjar-se'l. Els aliments “dolents” (un mitjó, una sabata) tenen la placa amb vora vermella i no s'han d'escriure.

Objectiu: menjar 15 aliments abans que en caiguin 5 a terra.

Nivells: 1 a 3, lletres; 4, síl·labes; 5 i 6, el nom de l'aliment (poma, pa, maduixa, formatge).

Aspecte: plastilina mat amb marques de dits; animació dels personatges a 12 fotogrames per segon com un stop motion. Les plaques es mouen a 60 per ser fluides.

Animació i so: el monstre s'infla una mica amb cada mos, i amb el darrer fa un rot còmic i balla. Si menja un aliment dolent, fa una ganyota i l'escup. Música de marimba juganera.

Encert i error: en encertar, mos sonor. En fallar, el monstre es queda mirant l'aliment que cau, i apareixen les dues plaques.

Col·leccionable: monstres de colors nous i barrets per vestir-lo.

### 8. Talla fruita

Concepte. Fruites amb lletres salten pels aires i es tallen escrivint-les.

Pantalla: una taula de fusta fosca vista de front. Les fruites salten des de baix en paràbola, amb la placa de lletra sempre horitzontal. A dalt, el comptador de talls i el rellotge.

Com es juga: escriure la lletra d'una fruita la talla. Les bombes porten la placa amb vora vermella i no s'han de tocar. Diversos talls seguits sense error fan combo.

Objectiu: 30 talls en 60 segons.

Nivells: 1 a 3, una lletra per fruita; 4, síl·labes; 5, el nom de la fruita; 6, fruites grans que es parteixen en dues meitats, cadascuna amb una paraula.

Aspecte: guaix brillant i sucós, amb l'interior de cada fruita pintat amb detall (llavors de síndria, fibres de taronja).

Animació i so: el tall és un traç de llum blanca; les meitats cauen amb física i deixen esquitxades que s'esvaeixen. Música de percussió ràpida.

Encert i error: en encertar, so de tall i suc. En fallar, la fruita cau sencera amb un so sord, i apareixen les dues plaques. Tocar una bomba acaba el combo, però no la partida.

Col·leccionable: fruites exòtiques que s'afegeixen a la fruiteria del museu.

### 9. Jardí de lletres

Concepte. Un jardí que creix amb cada lletra, sense pressa.

Pantalla: un jardí pintat a l'aquarel·la, vist de costat, amb terra a baix i cel a dalt. Hi ha llavors enterrades amb una placa de lletra clavada al costat.

Com es juga: escriure la lletra d'una llavor la fa néixer. Les flors atrauen papallones; els arbustos, ocells; els arbres, esquirols. Un rec periòdic fa aparèixer llavors noves.

Objectiu: completar el jardí de l'estació i atreure-hi els 6 animals que hi viuen. Hi ha 4 jardins, un per estació.

Nivells: 1 a 3, flors amb lletra; 4, arbustos amb síl·laba; 5 i 6, arbres amb paraula.

Aspecte: aquarel·la amb pigment que s'escampa i vores fosques, sobre paper de gra gruixut. El cel canvia de color amb l'hora del dia.

Animació i so: cada planta neix com una taca d'aigua que s'escampa i després es defineix amb el traç. Els animals arriben volant o corrent i s'hi queden. Música d'arpa i ocells.

Encert i error: en encertar, so de brot. En fallar, la llavor tremola, no neix, i apareixen les dues plaques.

Col·leccionable: els 4 jardins acabats, que es poden visitar al museu.

### 10. Pesca a l'estany

Concepte. Peixos que neden tranquils i es pesquen escrivint la seva lletra.

Pantalla: un estany vist des de dalt, amb nenúfars i pedres. L'avatar de l'alumne pesca des d'una barca a baix. Els peixos neden amb l'aleta dorsal fora de l'aigua, on porten la placa.

Com es juga: escriure la lletra d'un peix llança l'ham cap a ell. No hi ha temps; els peixos s'apropen i s'allunyen lentament.

Objectiu: omplir l'aquari amb les 12 espècies de l'estany. Hi ha 4 estanys (riu, llac, mar, fons marí).

Nivells: 1 a 3, peixos amb lletra; 4, síl·laba; 5, peixos grans amb paraula; 6, el nom de l'espècie (tonyina, llobarro, cavallet de mar).

Aspecte: aquarel·la amb aigua animada: càustiques de llum al fons, reflexos del cel i ones que es propaguen.

Animació i so: l'ham entra a l'aigua fent ones; el peix salta fora i cau a la galleda. Música de guitarra lenta i so d'aigua.

Encert i error: en encertar, esquitx d'aigua i el peix fa una mirada sorpresa. En fallar, l'ham cau a l'aigua buida, i apareixen les dues plaques.

Col·leccionable: els peixos de l'aquari, amb una fitxa de cada espècie.

## Activitats 11 a 15

### 11. Globus amunt

Concepte. Una festa d'aniversari on cal rebentar els globus abans que arribin al sostre.

Pantalla: una sala de festes vista de front, amb garlandes i un pastís. Els globus pugen des de baix amb la placa de lletra penjada del fil. A dalt, un sostre amb xinxetes.

Com es juga: escriure la lletra d'un globus el rebenta. Els globus pugen a ritmes diferents i es balancegen una mica.

Objectiu: que no se n'escapin més de 5 en una festa de 90 segons.

Nivells: 1 a 3, globus solts; 4, rams de 2 o 3 globus que formen una síl·laba i s'han de rebentar en ordre; 5 i 6, rams que formen una paraula.

Aspecte: paper xarol i làtex brillant amb reflex especular. La placa penja del fil i no es deforma amb el globus.

Animació i so: cada globus rebentat allibera confeti de paper que cau amb física. Els convidats (animals) aplaudeixen. Música de festa amb vents.

Encert i error: en encertar, “pum” i confeti. En fallar, el globus fa un “boing” i continua pujant, i apareixen les dues plaques.

Col·leccionable: decoracions noves per a la festa.

### 12. El tren de paraules

Concepte. Muntar un tren de fusta vagó a vagó i portar-lo de viatge.

Pantalla: una andana en 3D amb vagons de fusta esperant a la via de servei, cadascun amb una placa de lletra al lateral. La locomotora, a la via principal, mostra la lletra o paraula que vol formar.

Com es juga: escriure la lletra del vagó que demana la locomotora el fa rodar i enganxar-s'hi. Quan el tren és complet, l'alumne prem Retorn i el tren surt.

Objectiu: portar mercaderies a les 8 estacions del mapa (granja, mina, port, ciutat…).

Nivells: 1 a 3, trens d'1 a 3 vagons amb lletres soltes; 4, trens que formen una síl·laba; 5 i 6, trens que formen una paraula, amb vagons esquer.

Aspecte: Three.js amb tren de fusta tipus joguina clàssica, amb fusta envernissada, imants i vies que encaixen. Profunditat de camp de maqueta.

Animació i so: en sortir, la càmera segueix el tren per ponts, túnels i turons de maqueta durant uns segons. So de rodes de fusta i xiulet. Música de ragtime al piano.

Encert i error: en encertar, l'imant fa “clac”. En fallar, el vagó equivocat avança un pam i torna enrere, i apareixen les dues plaques.

Col·leccionable: vagons especials (de circ, de correu, de gelats).

### 13. Torre fins als núvols

Concepte. Apilar blocs de fusta amb una grúa fins a tocar els núvols.

Pantalla: en 3D, un solar amb una grúa de joguina. Un bloc amb la placa de lletra es balanceja penjat del ganxo. La càmera puja amb la torre.

Com es juga: escriure la lletra del bloc el deixa caure. Si s'escriu quan el bloc passa pel centre, cau ben alineat; com més tard, més desplaçat. Els blocs mal alineats fan que la torre es balancegi.

Objectiu: arribar als núvols, a 20 blocs, i batre el rècord propi. Si la torre cau, es compta l'altura assolida.

Nivells: 1 a 3, blocs amb lletra; 4, blocs amb síl·laba; 5 i 6, pisos sencers amb una paraula.

Aspecte: Three.js amb blocs de fusta pintada i física real. Ciutat de colors pastel al fons; núvols de cotó al final.

Animació i so: cada bloc fa un “toc” de fusta. En arribar als núvols, focs artificials de paper. Música que guanya instruments a cada pis.

Encert i error: en encertar, el bloc cau. En fallar, el bloc continua balancejant-se, i apareixen les dues plaques.

Col·leccionable: formes noves de bloc (teulada, rellotge, campanar).

### 14. Concert de tecles

Concepte. Un joc de ritme on les lletres arriben al compàs de la música.

Pantalla: un escenari de nit amb el públic d'animals en silueta. Al centre, 3 a 5 carrils de neó que baixen cap a una línia lluminosa. Les plaques de lletra baixen pels carrils.

Com es juga: prémer la lletra quan arriba a la línia. Hi ha marge de tolerància generós per als petits. Cada encert toca una nota de la melodia.

Objectiu: acabar la cançó amb almenys un 80% d'encerts per guanyar l'estrella del concert.

Nivells: 1 a 3, 3 carrils i tempo lent; 4, síl·labes que coincideixen amb la lletra cantada de la cançó; 5 i 6, 5 carrils i paraules de la cançó, en català.

Aspecte: llum i neó amb bloom, focus de colors que escombren l'escenari. Les plaques tenen vora lluminosa i interior llis.

Animació i so: el públic balla quan l'alumne encerta i s'asseu quan falla molt. Cançons originals, una per nivell.

Encert i error: en encertar, la nota sona neta i el carril fa un pols de llum. En fallar, la nota sona desafinada, i apareixen les dues plaques al costat del carril.

Col·leccionable: discos d'or amb la cançó, que es poden escoltar al museu.

### 15. Constel·lacions

Concepte. Unir estrelles amb lletres fins que es dibuixa un animal al cel.

Pantalla: un cel de nit en cianotípia, en blaus profunds amb traços blancs. Les estrelles tenen una placa de lletra petita al costat. Un estel guia indica la següent estrella.

Com es juga: escriure la lletra de l'estrella que marca l'estel guia l'uneix a l'anterior amb una línia daurada. No hi ha temps.

Objectiu: completar les 12 constel·lacions del planisferi, cadascuna amb una llegenda breu explicada per la veu.

Nivells: 1 a 3, figures de 4 a 8 estrelles; 4, síl·labes; 5 i 6, l'ordre de les estrelles forma el nom de l'animal (L, L, E, Ó).

Aspecte: cianotípia amb gra de paper i tinta daurada que brilla.

Animació i so: en acabar, l'animal es dibuixa sol damunt les línies i camina pel cel uns segons. Música de caixa de música i celesta.

Encert i error: en encertar, la línia es traça amb un so de campaneta. En fallar, l'estrella parpelleja un cop i apareixen les dues plaques.

Col·leccionable: les constel·lacions al planisferi del museu.

## Activitats 16 a 20

### 16. El laberint del tresor

Concepte. Un explorador avança per un laberint triant camí a cada cruïlla escrivint-ne la lletra.

Pantalla: un mapa de pirates en paper kraft envellit, vist des de dalt. L'explorador porta una torxa que il·lumina un cercle al seu voltant; la resta del mapa queda en penombra. A cada cruïlla, cada camí té un cartell de fusta amb la placa de lletra.

Com es juga: escriure la lletra d'un cartell fa que l'explorador vagi per aquell camí fins a la cruïlla següent. Les claus i el cofre es veuen de lluny com una lluentor.

Objectiu: recollir 3 claus i obrir el cofre. Sense temps.

Nivells: 1 a 3, cruïlles de 2 camins amb lletres; 4, de 3 camins amb síl·labes; 5, de 4 camins amb paraules; 6, els cartells són pistes (“el camí del sol”, “passa pel pont”).

Aspecte: paper kraft amb tinta i ceres, taques de cafè i plecs. Explorador en 2.5D.

Animació i so: el camí recorregut queda marcat amb una línia de punts vermella. El cofre s'obre amb un esclat de llum. Música d'aventura amb flauta i tambors.

Encert i error: en encertar, l'explorador es posa en marxa. En fallar, l'explorador mira els cartells pensatiu, i apareixen les dues plaques.

Col·leccionable: els tresors trobats (corones, monedes antigues, brúixoles).

### 17. La pastisseria

Concepte. Preparar i decorar pastissos per als clients escrivint els ingredients.

Pantalla: un taulell de pastisseria de plastilina en colors pastel. A l'esquerra, el client amb un globus de pensament que mostra el pastís que vol; al centre, el bol; a la dreta, els prestatges d'ingredients amb la seva placa.

Com es juga: escriure la lletra o el nom d'un ingredient el fa caure al bol. Quan la recepta és completa, el pastís surt del forn i comença la fase de decoració lliure, on cada lletra afegeix una decoració.

Objectiu: servir 6 encàrrecs i obrir la pastisseria en una nova ciutat.

Nivells: 1 a 3, ingredients amb lletra; 4, síl·labes; 5 i 6, noms d'ingredients (maduixa, xocolata, nata) i receptes més llargues.

Aspecte: plastilina en stop motion amb marques de dits i textura de massa.

Animació i so: els ingredients cauen i la massa es barreja amb una animació de remolí. El client fa un tast i una cara de plaer. Música de jazz suau.

Encert i error: en encertar, l'ingredient cau amb “plop”. En fallar, el client arrufa el nas, i apareixen les dues plaques.

Col·leccionable: fotos dels pastissos decorats.

### 18. Torre de control

Concepte. Fer aterrar avions abans que es quedin sense combustible.

Pantalla: un aeroport vist des de dalt en estil de cartell serigrafiat dels anys 60. Els avions volen en cercle amb una placa de lletra a la cua i una barra de combustible petita.

Com es juga: escriure la lletra d'un avió li dóna permís per aterrar. Si el combustible s'acaba, l'avió fa un aterratge d'emergència (còmic, no dramàtic).

Objectiu: fer aterrar 20 avions en un torn sense cap emergència.

Nivells: 1 a 3, avions amb lletra; 4, síl·labes; 5 i 6, el nom de la ciutat d'on vénen (Vic, Reus, Girona, Barcelona).

Aspecte: serigrafia amb colors plans, registre lleugerament desplaçat i gra de tinta. Avions de formes arrodonides.

Animació i so: els avions deixen una estela de punts; en aterrar, rodolen per la pista fins a la terminal. Música de swing i veu de ràdio de la torre.

Encert i error: en encertar, la torre diu “autoritzat”. En fallar, l'avió fa una volta més, i apareixen les dues plaques.

Col·leccionable: segells de les ciutats al passaport del pilot.

### 19. Talps del teclat

Concepte. Un “picar talps” on els forats estan col·locats exactament com les tecles del teclat.

Pantalla: un prat de felpa verda amb 26 a 30 forats en la disposició exacta del teclat de l'alumne (fila superior, central i inferior, amb el desplaçament real de cada fila). A dalt, el rellotge i el comptador.

Com es juga: quan un talp surt per un forat, l'alumne prem la tecla que ocupa la mateixa posició al teclat. La lletra del talp ho confirma. Aquest joc treballa directament la posició de les tecles.

Objectiu: atrapar 40 talps en 60 segons.

Nivells: 1 i 2, només s'obren els forats de les lletres del nivell i la placa es veu tot el temps; 3, tots els forats; 4, la placa apareix només mig segon i després només compta la posició; 5 i 6, surten 3 a 5 talps alhora que formen una paraula, en ordre.

Aspecte: felpa amb fibres i costures; talps de peluix amb casc d'obra i ulleres.

Animació i so: els talps surten amb un salt tou i, en ser atrapats, fan cara de sorpresa i tornen avall. Els encerts seguits fan florir el prat. Música de banda de poble.

Encert i error: en encertar, “boing” de molla. En fallar, el talp fa una ganyota i es posa a riure, i apareixen les dues plaques amb el forat de cadascuna marcat al prat.

Col·leccionable: cascos i disfresses per als talps.

### 20. L'eco de la cova

Concepte. Repetir seqüències de lletres que una cova canta i il·lumina, cada cop més llargues.

Pantalla: l'interior d'una cova amb cristalls de colors a les parets. Al centre, una pedra plana on apareixen les plaques de la seqüència.

Com es juga: la cova mostra i diu una seqüència de lletres, cadascuna amb un cristall que s'il·lumina i una nota. Després les plaques s'amaguen i l'alumne la repeteix. Cada ronda afegeix una lletra.

Objectiu: arribar a una seqüència de 8 i batre el rècord propi.

Nivells: 1 a 3, seqüències de lletres que es veuen i se senten; 4, seqüències de síl·labes; 5 i 6, paraules dites només per la veu, sense veure-les.

Aspecte: cristalls amb refracció i llum dinàmica que es reflecteix a les parets humides.

Animació i so: cada lletra té un color i una nota fixos, de manera que la seqüència també és una melodia. Eco real a la veu.

Encert i error: en encertar, el cristall s'encen i ressona. En fallar, la cova es queda a les fosques un moment, es mostra la seqüència correcta amb la lletra fallada marcada, i es torna a provar la mateixa ronda.

Col·leccionable: cristalls rars per a la vitrina de minerals del museu.

## Activitats 21 a 25

### 21. La granja amagada

Concepte. Obrir les portes de la granja per descobrir quin animal hi ha a dins.

Pantalla: un graner i els seus coberts dibuixats amb ceres, vistos de front. Cada porta té una placa de lletra clavada. A baix, el quadern de l'excursió amb els forats dels 20 animals.

Com es juga: escriure la lletra d'una porta l'obre i en surt un animal que diu el seu nom i fa el seu so. Als nivells alts, la veu diu el nom d'un animal i l'alumne l'escriu per cridar-lo.

Objectiu: trobar els 20 animals i omplir el quadern. Sense temps.

Nivells: 1 a 3, portes amb lletra; 4, síl·labes; 5 i 6, el nom de l'animal dictat per la veu.

Aspecte: ceres de colors sobre paper de dibuix, com un dibuix infantil molt ben fet, amb el traç que “bull” suaument.

Animació i so: les portes s'obren redibuixant-se. Els animals surten amb una animació exagerada (el porc rellisca, la gallina vola mig metre). Música de country amb banjo.

Encert i error: en encertar, l'animal surt i s'enganxa al quadern. En fallar, de la porta en surt un ratolí que fa “no, no” amb el cap, i apareixen les dues plaques.

Col·leccionable: el quadern de l'excursió, amb una fitxa per animal.

### 22. Penals de lletres

Concepte. Una tanda de penals: aturar els xuts i xutar a la cantonada bona.

Pantalla: un estadi de nit amb focus, vist des de darrere de la porteria (quan para) o des del punt de penal (quan xuta). Marcador de tauler antic a dalt.

Com es juga: com a porter, cada pilota porta una placa de lletra; escriure-la abans que arribi la para. Com a xutador, les 4 cantonades de la porteria tenen una lletra i el porter rival en tapa una; es xuta escrivint una de les altres.

Objectiu: guanyar la tanda de 5 penals i avançar en una lliga de 6 partits.

Nivells: 1 a 3, lletres; 4, síl·labes; 5 i 6, paraules a les cantonades, i porters rivals més ràpids.

Aspecte: cromo esportiu i retransmissió televisiva: gespa amb ratlles, focus, jugadors animals en 2.5D amb samarretes. El marcador gira les lletres només per als resultats.

Animació i so: càmera lenta a l'aturada, xarxa que es mou en marcar. Gentada i comentarista amb frases curtes.

Encert i error: en encertar, l'estadi crida. En fallar, gol del rival o pilota al pal, i apareixen les dues plaques.

Col·leccionable: cromos dels jugadors i la copa de la lliga.

### 23. El robot ballarí

Concepte. Programar una coreografia per a un robot escrivint els passos.

Pantalla: una pista de ball de rajoles lluminoses amb el robot de llauna al centre. A baix, una cinta de passos on s'acumulen les plaques que l'alumne escriu.

Com es juga: cada lletra és un pas: B braços amunt, G gir, S salt, P picar de mans, C cop de cap, R robot (moviment robòtic). Retorn fa que el robot balli la seqüència amb música.

Objectiu: en mode repte, imitar el ball d'un altre robot pas a pas. En mode lliure, crear una coreografia de 10 passos i guardar-la.

Nivells: 1 a 3, passos amb lletra; 4, síl·labes (SA, GI); 5 i 6, passos amb paraula (salta, gira, pica de mans).

Aspecte: llauna de joguina antiga amb pintura de colors, reflexos de metall i cargols. Discoteca amb bola de miralls.

Animació i so: cada pas té la seva animació esquelètica, amb sons de molla i engranatge. Música funk.

Encert i error: en mode repte, el pas correcte fa brillar el robot model. Una lletra sense pas assignat fa que el robot s'encalli un moment, i apareixen les dues plaques.

Col·leccionable: les coreografies guardades, que es poden veure ballar al museu.

### 24. La serp de paraules

Concepte. Una serp brodada que menja lletres en ordre per formar paraules.

Pantalla: tot el tauler és una tela de punt de creu amb una quadrícula subtil. Les lletres són botons grans cosits a la tela, amb la placa al centre. A dalt, la paraula objectiu amb les lletres que ja s'han menjat marcades.

Com es juga: escriure una lletra fa que la serp vagi cap al botó més proper amb aquella lletra, esquivant el seu propi cos. Cal menjar-les en l'ordre de la paraula.

Objectiu: completar 10 paraules sense que la serp xoqui amb ella mateixa.

Nivells: 1 a 3, la veu diu una lletra i la serp l'ha de menjar entre 3 o 4 botons; 4, síl·labes; 5, paraules de 3 a 5 lletres; 6, paraules llargues amb lletres esquer.

Aspecte: brodat de punt de creu amb fils de colors que tenen volum i brillantor de cotó perlé.

Animació i so: la serp es “broda” punt a punt mentre avança, amb una agulla que la segueix. En completar una paraula, la serp la diu i fa una volta d'alegria. Música de caixa de música ràpida.

Encert i error: en encertar, el botó es descus i la serp creix. Si es prem una lletra fora d'ordre, la serp s'atura, mira la paraula, i apareixen les dues plaques.

Col·leccionable: les teles brodades amb les paraules completades.

### 25. El carter

Concepte. Repartir les cartes del barri a la bústia que toca.

Pantalla: un llibre pop-up que s'obre i aixeca un carrer de cases petites i acolorides. El carter, amb bicicleta, és al centre; cada casa té una bústia amb una placa. A la saca, el sobre que toca repartir, amb la seva placa.

Com es juga: escriure la lletra del sobre el fa volar fins a la bústia amb la mateixa lletra. Quan s'acaba el carrer, es gira la pàgina i s'aixeca el següent.

Objectiu: repartir tot el correu del barri, 5 carrers. Sense temps.

Nivells: 1 a 3, bústies amb lletra; 4, amb síl·laba; 5, amb el nom del veí (Aina, Pau, Jana); 6, adreces curtes (carrer Sol 3).

Aspecte: paper retallat en pop-up 2.5D, amb plecs, solapes i ombres de capa reals.

Animació i so: els sobres fan una corba de paper i la bústia es tanca amb un “clac”; el veí surt a la finestra i saluda. So de timbre de bicicleta i de pàgina que es gira. Música de vals lleuger.

Encert i error: en encertar, el veí agraeix la carta. En fallar, el sobre torna a la saca fent una volta, i apareixen les dues plaques.

Col·leccionable: postals dels veïns, que es poden llegir al museu.
