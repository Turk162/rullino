# Brief per Claude Code — PWA "Rullino"
### Diario di scatto per fotografia analogica (v1)

> Specifica iniziale da fornire a Claude Code. Salvala nel repo come `SPEC.md` (e considera di tenerne una sintesi in `CLAUDE.md` come contesto persistente).

---

## 1. Obiettivo

Costruire una **Progressive Web App** minimale per registrare gli scatti di fotografia analogica **sul campo, da telefono Android, offline**. Deve sostituire le app esistenti — respinte perché lente da compilare e piene di campi inutili — con un inserimento a **pochi tocchi** e i soli campi che servono. Ospitata su **GitHub Pages**, **senza backend**.

## 2. Contesto d'uso

- Fotografo con **Canon AE-1** (35mm), obiettivo **FD 50mm f/1.8**.
- Uso sul campo, spesso con una mano e in piena luce: tap target grandi, alto contrasto, tema scuro.
- La pellicola **non ha EXIF**: i parametri di scatto esistono solo se registrati qui.
- I dati servono poi per l'analisi con un tutor AI esterno: l'**export deve essere pulito e completo**.

## 3. Stack

- **React + Vite**
- **vite-plugin-pwa** (offline, installabile)
- **Dexie.js** per IndexedDB (persistenza locale)
- **React Router in modalità HashRouter** (evita i 404 di GitHub Pages al refresh delle route)
- Nessun backend, account, analytics o tracking

## 4. Principi di design

1. Registrare uno scatto deve costare pochi secondi e pochi tap.
2. Solo i campi essenziali visibili; tutto il resto opzionale e collassato.
3. Offline-first: deve funzionare senza rete.
4. Dati dell'utente: export sempre disponibile, nessun lock-in.

## 5. Modello dati

### Roll (rullino)
| campo | tipo | note |
|---|---|---|
| id | string (uuid) | |
| name | string | es. "R02" |
| camera | string | default "Canon AE-1" |
| lens | string | default "FD 50mm f/1.8" |
| filmStock | string | es. "Kodak Gold 200" |
| iso | number | |
| status | enum | "in_corso" \| "da_sviluppare" \| "sviluppato" \| "scansionato" \| "archiviato" (default "in_corso") |
| startDate | date | |
| notes | string | opzionale |
| createdAt | timestamp | |

### Frame (scatto)
| campo | tipo | note |
|---|---|---|
| id | string (uuid) | |
| rollId | string | fk → Roll.id |
| frameNumber | number | auto-incrementale per rullino |
| shutter | string | es. "1/125" |
| aperture | string | es. "f/8" |
| mode | enum | "AE" \| "Manuale" (default "AE") |
| light | string | opzionale |
| subject | string | opzionale |
| intention | string | opzionale |
| tags | string[] | opzionale |
| result | string | opzionale, compilato dopo lo sviluppo |
| lesson | string | opzionale, compilato dopo |
| createdAt | timestamp | |

**Importante:** pellicola e ISO non si ripetono sullo scatto — si ereditano dal rullino e compaiono nell'export tramite join.

## 6. Scale dei valori (griglie di bottoni)

Definirle come array in un file `constants.js`, così sono modificabili se cambia attrezzatura.

- **Tempi (shutter):** `B, 1, 1/2, 1/4, 1/8, 1/15, 1/30, 1/60, 1/125, 1/250, 1/500, 1/1000`
- **Diaframmi (aperture):** `f/1.8, f/2.8, f/4, f/5.6, f/8, f/11, f/16, f/22`
- **Modi:** `AE, Manuale`
- **Tag:** `keeper, errore, esperimento`

Usare **esattamente** queste scale; non inventare valori intermedi.

## 7. Schermate

### 7.1 Home / Rullino attivo
- Card del rullino attivo: nome, pellicola, ISO, posa corrente / pose totali.
- Pulsante grande primario: **"Nuovo scatto"**.
- Navigazione verso: Rullini, Export.
- Se non c'è un rullino attivo: invito a crearne uno.

### 7.2 Nuovo scatto — *schermata critica, ottimizzare per velocità*
- Numero posa in alto, auto-incrementato, editabile con un tap.
- **Griglia bottoni TEMPO**: un tap seleziona ed evidenzia.
- **Griglia bottoni DIAFRAMMA**: un tap seleziona ed evidenzia.
- Toggle **MODO** (AE/Manuale), default AE.
- Sezione **"Dettagli"** collassata di default: Luce, Soggetto, Intenzione, Tag.
- Pulsante grande **"Salva scatto"**.
- Dopo il salvataggio: **ripropone gli stessi tempo/diaframma dell'ultimo scatto** (gli scatti consecutivi spesso condividono le impostazioni → meno tap), e incrementa la posa.

### 7.3 Rullini (gestione)
- Lista rullini con stato e numero scatti.
- Crea rullino: nome, camera (default), lens (default), pellicola, ISO, data inizio.
- Azioni: imposta come attivo, modifica, cambia stato, archivia.
- Tocca un rullino → dettaglio.

### 7.4 Dettaglio rullino / lista scatti
- Elenco scatti con posa, tempo, diaframma, tag.
- Tocca uno scatto → modifica (per compilare **Esito** e **Lezione** dopo lo sviluppo).

### 7.5 Export / Backup
- **Esporta CSV** (tutti o per rullino), colonne in quest'ordine: `Rullino, Posa, Pellicola, ISO, Tempo, Diaframma, Modo, Luce, Soggetto, Intenzione, Esito, Lezione, Data`. Pellicola e ISO risolti dal rullino.
- **Esporta JSON**: backup completo (rolls + frames), re-importabile.
- **Importa JSON**: ripristino backup, con conferma (replace o merge).

## 8. Requisiti non funzionali

- **PWA**: manifest completo, service worker, installabile su Android, icone 192 e 512 px.
- **Offline-first**: app shell in cache; i dati sono già locali (IndexedDB).
- **Mobile-first**, tema scuro, tap target ≥ 44px, alto contrasto per uso all'aperto.
- Avvio istantaneo; nessuna chiamata di rete a runtime.
- Persistenza robusta + **promemoria di backup**: avvisare che svuotare i dati del browser cancella tutto, con una CTA periodica a esportare il JSON.

## 9. Deployment (GitHub Pages) — punti critici

- `vite.config.js`: impostare `base: '/<nome-repo>/'`.
- Usare **HashRouter** per il routing (evita i 404 al refresh diretto di una route).
- `vite-plugin-pwa`: `registerType: 'autoUpdate'`; manifest con `start_url` e `scope` coerenti con il base path; Workbox per la cache offline dell'app shell.
- **GitHub Actions**: workflow che builda e pubblica su Pages.
- Verificare presto che scope del service worker e manifest funzionino sotto il sotto-path di Pages — è il punto dove queste app si rompono.

## 10. Struttura file suggerita

```
src/
  db/            # schema Dexie e funzioni CRUD
  components/    # ButtonGrid, RollCard, FrameForm, ...
  views/         # Home, NewFrame, Rolls, RollDetail, Export
  utils/         # exportCsv.js, exportJson.js, importJson.js
  constants.js   # scale tempi/diaframmi/modi/tag, default camera/lens
  App.jsx
  main.jsx
public/
  icons/         # 192, 512
.github/workflows/deploy.yml
vite.config.js
```

## 11. Fuori scope (v1)

- Sync/backup su **Nextcloud** (previsto per v2 via WebDAV).
- Esposimetro, GPS, meteo.
- Import scansioni / scrittura EXIF.
- Multi-utente, cloud, account.

## 12. Criteri di accettazione (Definition of Done)

- [ ] Installabile come PWA su Android e pienamente funzionante **offline**.
- [ ] Creazione rullino → attivazione → registrazione scatti in pochi tap.
- [ ] Tempo e diaframma selezionabili con **un solo tap** dalle griglie.
- [ ] Posa auto-incrementata; ultimo tempo/diaframma riproposti.
- [ ] Campi opzionali nascosti finché non servono.
- [ ] Export **CSV** (formato §7.5) e **JSON**; import JSON per ripristino.
- [ ] I dati persistono tra riavvii e reinstallazioni (finché non si cancellano i dati del browser).
- [ ] Promemoria di backup presente.

## 13. Note operative per Claude Code

- Inizia con lo scaffold Vite + React + PWA + Dexie, poi le schermate in quest'ordine: **Rullini → Nuovo scatto → Home → Dettaglio → Export**.
- Commit frequenti; configura il deploy GitHub Actions **presto** e verifica la PWA su Pages in anticipo (base path e service worker sono i punti delicati).
- Mantieni zero dipendenze inutili.
- Non introdurre campi o funzioni non elencati qui senza segnalarlo.
