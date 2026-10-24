# Pantalles, avatars, illa i viatge — 24 d’octubre de 2026

Integració de la maqueta aprovada: portada amb portal de fusta separat dels suports del moll, selector de perfils amb vuit avatars de roba, mapa amb icones d’activitat i fitxes detallades, i viatge amb veler, capes de fons i aigua animada. Els logos originals es conserven byte a byte.

L’illa es dibuixa amb terreny i camins natius de Canvas i elements artístics independents. El zoom es manté entre 0,43 i 2; els nous elements del paisatge disposen de prou píxels per al zoom màxim a la vista lògica 1600×900 amb DPR 2. L’avatar porta una base clara, un contorn turquesa i un halo per facilitar-ne la localització.

Es manté el prefix de dades `lecaa-tecla.` i l’estructura dels perfils, puntuacions i configuració. La compilació PWA genera una nova versió de memòria cau a partir del contingut de l’HTML. No s’hi incorpora el prefix de dades separat de la maqueta.

## Validació

- Compilació autònoma i PWA amb les 25 activitats.
- Chromium: zoom, arrossegament, selector de perfils i navegació per teclat, vuit avatars, 25 icones, fitxes i inici de totes les activitats; cap error JavaScript observat.
- Vistes 1600×900, 1024×768 i 768×1024; comprovació del mapa amb zoom 2 i DPR 2.
- Verificació que les bombolles no dibuixen miniatures de l’activitat i que les fitxes sí.
- Comprovació de fotogrames diferents del viatge amb animacions activades.
- Perfil existent amb puntuacions preservat i arrencada de la PWA sense connexió, incloent el mapa i les 25 icones.

Scripts: `qa/check-shell.cjs` i `qa/check-shell-pwa.cjs`. Resultats: `qa/shell-results.json` i `qa/shell-pwa-results.json`. Les proves automatitzades no equivalen a una comprovació física en tots els sistemes operatius.
