import { db } from './db.js'

// Impostazioni locali generiche (key-value). Non sono dati di scatto.

export async function getSetting(key) {
  const row = await db.settings.get(key)
  return row ? row.value : undefined
}

export function setSetting(key, value) {
  return db.settings.put({ key, value })
}

// Timestamp dell'ultimo backup JSON, per il promemoria (SPEC §8).
const LAST_BACKUP_KEY = 'lastBackupAt'

export function getLastBackupAt() {
  return getSetting(LAST_BACKUP_KEY)
}

export function setLastBackupAt(ts) {
  return setSetting(LAST_BACKUP_KEY, ts)
}
