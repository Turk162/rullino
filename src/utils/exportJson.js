import { db } from '../db/db.js'
import { getActiveRollId } from '../db/rolls.js'

// Backup completo re-importabile: rolls + frames + rullino attivo.
export async function buildBackup() {
  const [rolls, frames, activeRollId] = await Promise.all([
    db.rolls.toArray(),
    db.frames.toArray(),
    getActiveRollId(),
  ])
  return {
    app: 'rullino',
    version: 1,
    exportedAt: new Date().toISOString(),
    activeRollId,
    rolls,
    frames,
  }
}
