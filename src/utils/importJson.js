import { db } from '../db/db.js'
import { setActiveRoll } from '../db/rolls.js'

// Verifica e parsa un backup JSON. Lancia se il formato non è valido.
export function parseBackup(text) {
  const data = JSON.parse(text)
  if (!data || !Array.isArray(data.rolls) || !Array.isArray(data.frames)) {
    throw new Error('Formato non valido: mancano "rolls" o "frames".')
  }
  return data
}

// Applica il backup. mode: 'replace' (sostituisce tutto) | 'merge' (unisce per id).
export async function applyBackup(data, mode) {
  await db.transaction('rw', db.rolls, db.frames, db.settings, async () => {
    if (mode === 'replace') {
      await db.rolls.clear()
      await db.frames.clear()
    }
    await db.rolls.bulkPut(data.rolls)
    await db.frames.bulkPut(data.frames)
    // Il rullino attivo si ripristina solo in modalità replace.
    if (mode === 'replace') {
      await setActiveRoll(data.activeRollId ?? null)
    }
  })
}
