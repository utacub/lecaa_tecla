# Diverses PWA a utacub.github.io

Totes les apps publicades amb GitHub Pages des d'aquest compte comparteixen el mateix **origen**
(`https://utacub.github.io`). El navegador separa les apps instal·lades per l'`id` del manifest i
reparteix entre totes la mateixa memòria cau (CacheStorage), `localStorage` i IndexedDB. Per això
cada app ha de seguir aquestes normes:

1. **Manifest amb camins absoluts propis.** `id`, `start_url` i `scope` han de ser el camí de l'app,
   per exemple `"/lecaa_tecla/"`. Mai `"./"` ni `"/"` a l'`id`: un `id` relatiu es resol contra
   l'origen de `start_url`, de manera que `"./"` dona `https://utacub.github.io/` a totes les apps,
   i el navegador les confon (una actualització d'una app en substitueix una altra).
2. **Service worker dins la carpeta de l'app**, registrat amb `scope: './'`, que no pugui controlar
   pàgines d'altres apps.
3. **Memòries cau amb prefix propi** (`lecaa-tecla-`, `lecaa-docs-`...). En activar-se, el service
   worker només esborra les memòries amb el seu prefix i en llegeix només la seva (`cacheName`).
4. **`localStorage` i IndexedDB amb prefix propi** (`lecaa-tecla.`, `lecaa-tecla-veus`...).
5. **Mai** `caches.delete` sense filtre, `localStorage.clear()`, ni `getRegistrations()` per
   desregistrar service workers d'altres apps.

Una app a l'arrel (`https://utacub.github.io/`) tindria un `scope` que inclou totes les altres:
no s'ha de publicar cap PWA a l'arrel.

Referències: W3C Web Application Manifest (membres `id`, `start_url`, `scope`) i MDN
(*Web app manifest: id*, *CacheStorage*, *ServiceWorkerContainer.register()*).

## Instal·lació completa sense connexió (2026-11-21)

Igual que LECAA CAST 0.6.13:

- `index.html` conté tot el programa (25 jocs, il·lustracions, sons de les lletres de tots els idiomes, tipografies i logos). El service worker (`tools/pwa.py`) el desa juntament amb el manifest i les icones. Només queden fora les veus neuronals opcionals (Piper), que es baixen des dels ajustos de la veu i es desen a IndexedDB (`lecaa-tecla-veus`).
- La precàrrega és atòmica: si la connexió es talla, s'esborra la memòria d'aquella versió i la portada ofereix «Torna-ho a provar».
- Les peticions es fan amb `cache: "no-cache"`: no es desa mai una còpia antiga de la memòria HTTP (GitHub Pages en guarda 10 minuts), però si la còpia és vigent no es torna a baixar.
- `index.html` es baixa en flux i es compten els bytes: la portada i l'avís d'instal·lació mostren una barra de progrés. La mida exacta (`PWA_BYTES`, sense comprimir) l'escriu `tools/pwa.py` en un marcador d'amplada fixa que deixa `build.py`.
- El botó «Instal·lar» obre primer un avís de mida (què es desa, quant ocupa, wifi, espai lliure segons el navegador) i després el diàleg del navegador. En instal·lar es demana emmagatzematge persistent (`navigator.storage.persist()`).
