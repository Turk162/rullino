import { db } from './db.js'

// CRUD scatti (SPEC §5, §7.2). Tutto su IndexedDB via Dexie.

// Tutti gli scatti di un rullino, ordinati per numero di posa.
export async function getFramesByRoll(rollId) {
  const frames = await db.frames.where('rollId').equals(rollId).toArray()
  return frames.sort((a, b) => (a.frameNumber || 0) - (b.frameNumber || 0))
}

// Prossimo numero di posa per il rullino (max esistente + 1, oppure 1).
export async function getNextFrameNumber(rollId) {
  const frames = await db.frames.where('rollId').equals(rollId).toArray()
  if (!frames.length) return 1
  return Math.max(...frames.map((f) => f.frameNumber || 0)) + 1
}

// Ultimo scatto registrato sul rullino (per riproporre tempo/diaframma).
export async function getLastFrame(rollId) {
  const frames = await db.frames.where('rollId').equals(rollId).sortBy('createdAt')
  return frames.length ? frames[frames.length - 1] : null
}

// Crea uno scatto collegato al rullino. Esito e Lezione restano vuoti
// (si compilano dopo lo sviluppo, SPEC §7.4).
export async function createFrame(data) {
  const frame = {
    id: crypto.randomUUID(),
    rollId: data.rollId,
    frameNumber: Number(data.frameNumber),
    shutter: data.shutter || null,
    aperture: data.aperture || null,
    mode: data.mode || 'AE',
    light: (data.light || '').trim(),
    subject: (data.subject || '').trim(),
    intention: (data.intention || '').trim(),
    tags: Array.isArray(data.tags) ? data.tags : [],
    result: '',
    lesson: '',
    createdAt: Date.now(),
  }
  await db.frames.add(frame)
  return frame
}
