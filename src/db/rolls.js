import { db } from './db.js'
import { DEFAULT_CAMERA, DEFAULT_LENS } from '../constants.js'

// CRUD rullini (SPEC §5, §7.3). Tutto su IndexedDB via Dexie.

const ACTIVE_ROLL_KEY = 'activeRollId'

// Crea un rullino. Applica i default attrezzatura e stato iniziale "in_corso".
export async function createRoll(data) {
  const roll = {
    id: crypto.randomUUID(),
    name: (data.name || '').trim(),
    camera: (data.camera || DEFAULT_CAMERA).trim(),
    lens: (data.lens || DEFAULT_LENS).trim(),
    filmStock: (data.filmStock || '').trim(),
    iso: data.iso != null && data.iso !== '' ? Number(data.iso) : null,
    status: data.status || 'in_corso',
    startDate: data.startDate || null,
    notes: (data.notes || '').trim(),
    createdAt: Date.now(),
  }
  await db.rolls.add(roll)
  return roll
}

export function getRoll(id) {
  return db.rolls.get(id)
}

// Tutti i rullini, dal più recente al più vecchio.
export function getAllRolls() {
  return db.rolls.orderBy('createdAt').reverse().toArray()
}

// Applica modifiche parziali; normalizza i campi noti.
export async function updateRoll(id, changes) {
  const patch = { ...changes }
  if ('name' in patch) patch.name = (patch.name || '').trim()
  if ('camera' in patch) patch.camera = (patch.camera || DEFAULT_CAMERA).trim()
  if ('lens' in patch) patch.lens = (patch.lens || DEFAULT_LENS).trim()
  if ('filmStock' in patch) patch.filmStock = (patch.filmStock || '').trim()
  if ('notes' in patch) patch.notes = (patch.notes || '').trim()
  if ('iso' in patch) patch.iso = patch.iso != null && patch.iso !== '' ? Number(patch.iso) : null
  await db.rolls.update(id, patch)
}

// Cambia lo stato. Il rullino attivo è quello "in macchina": se un rullino
// attivo lascia lo stato "in_corso", viene automaticamente liberato dall'attivo.
export async function setRollStatus(id, status) {
  await db.rolls.update(id, { status })
  if (status !== 'in_corso' && (await getActiveRollId()) === id) {
    await setActiveRoll(null)
  }
}

// Numero di scatti collegati a un rullino.
export function countFrames(rollId) {
  return db.frames.where('rollId').equals(rollId).count()
}

// --- Rullino attivo (persistito nella tabella settings) ---

export async function getActiveRollId() {
  const row = await db.settings.get(ACTIVE_ROLL_KEY)
  return row ? row.value : null
}

export function setActiveRoll(id) {
  return db.settings.put({ key: ACTIVE_ROLL_KEY, value: id })
}
