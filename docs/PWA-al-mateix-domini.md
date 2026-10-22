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
