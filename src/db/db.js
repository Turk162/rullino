import Dexie from 'dexie'

// Persistenza locale (SPEC §5). I dati vivono SOLO qui, mai in localStorage.
export const db = new Dexie('rullino')

// Schema v1. Solo gli indici servono nello schema string di Dexie;
// gli altri campi del modello (SPEC §5) sono liberi sul record.
//   Roll:  id, name, camera, lens, filmStock, iso, status, startDate, notes, createdAt
//   Frame: id, rollId, frameNumber, shutter, aperture, mode, light, subject,
//          intention, tags, result, lesson, createdAt
db.version(1).stores({
  rolls: 'id, status, createdAt',
  frames: 'id, rollId, [rollId+frameNumber], createdAt',
})

export default db
