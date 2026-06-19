# CLAUDE.md — Progetto "Rullino"
### PWA diario di scatto per fotografia analogica

## Cos'è
PWA minimale per registrare gli scatti di fotografia analogica sul campo, da telefono Android, **offline**. Nessun backend. Ospitata su **GitHub Pages**.

I requisiti completi sono in **`SPEC.md`**: leggilo prima di iniziare e consideralo la fonte di verità per *cosa* costruire. Questo file descrive *come* lavorare.

## Stack
- **React + Vite**
- **vite-plugin-pwa** (PWA, offline, installabile)
- **Dexie.js** (IndexedDB, persistenza locale)
- **react-router-dom in modalità HashRouter** — obbligatorio: con BrowserRouter, GitHub Pages restituisce 404 al refresh diretto di una route.

## Comandi
- `npm install` — installa le dipendenze
- `npm run dev` — server di sviluppo locale
- `npm run build` — build di produzione in `dist/`
- `npm run preview` — anteprima locale della build
- (documenta qui eventuali comandi di lint/test se li aggiungi)

## Convenzioni
- Componenti funzionali + hooks. Niente class component.
- Codice e nomi in **inglese**; testo dell'**interfaccia in italiano**.
- Zero dipendenze superflue: scegli sempre la soluzione più semplice.
- I dati degli scatti vivono **solo in IndexedDB via Dexie**. Mai usare localStorage/sessionStorage per i dati.
- Le scale di tempi/diaframmi/modi/tag stanno in `src/constants.js` e sono **esattamente** quelle di SPEC §6: non inventarne altre.

## Vincoli importanti
- **Offline-first**: l'app deve funzionare senza rete; nessuna chiamata di rete a runtime.
- **Nessun backend, account o tracking.**
- **HashRouter** obbligatorio.
- `vite.config.js` deve avere `base: '/<nome-repo>/'` coerente col nome del repo GitHub, altrimenti la PWA non si carica su Pages.
- Manifest PWA: `start_url` e `scope` coerenti col base path; icone 192 e 512 px.
- Non aggiungere campi dati o funzioni non presenti in SPEC senza segnalarlo prima.

## Deploy (GitHub Pages)
- Build statica pubblicata su GitHub Pages.
- Preferito: workflow **GitHub Actions** che builda e pubblica a ogni push sul branch principale.
- Verifica **presto**, su uno scaffold minimo, che la PWA si carichi correttamente sotto il sotto-path di Pages: base path e service worker sono i punti dove si rompe.

## Ordine di lavoro consigliato
1. Scaffold Vite + React + PWA + Dexie + HashRouter.
2. Configura il deploy (GitHub Actions) e verifica la PWA su Pages con una pagina minima.
3. Schermate, in ordine: **Rullini → Nuovo scatto → Home → Dettaglio rullino → Export**.
4. Rifinitura: tema scuro, tap target ampi, promemoria di backup.

## Cosa NON fare
- Non usare BrowserRouter.
- Non mettere i dati in localStorage/sessionStorage.
- Non introdurre UI kit o framework pesanti senza necessità.
- Non inventare valori per le scale fotografiche.
- Non implementare le funzioni "fuori scope v1" di SPEC §11 (Nextcloud, esposimetro, GPS, EXIF).
