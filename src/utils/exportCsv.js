import { db } from '../db/db.js'

// Colonne nell'ordine esatto di SPEC §7.5. Pellicola e ISO risolti dal rullino.
const COLUMNS = [
  'Rullino', 'Posa', 'Pellicola', 'ISO', 'Tempo', 'Diaframma', 'Modo',
  'Luce', 'Soggetto', 'Intenzione', 'Esito', 'Lezione', 'Data',
]

function esc(value) {
  const s = value == null ? '' : String(value)
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

function fmtDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// Costruisce il CSV. rollId === null|undefined → tutti i rullini.
export async function buildCsv(rollId) {
  const rolls = await db.rolls.toArray()
  const rollMap = new Map(rolls.map((r) => [r.id, r]))
  const frames = rollId
    ? await db.frames.where('rollId').equals(rollId).toArray()
    : await db.frames.toArray()

  frames.sort((a, b) => {
    const an = rollMap.get(a.rollId)?.name || ''
    const bn = rollMap.get(b.rollId)?.name || ''
    if (an !== bn) return an < bn ? -1 : 1
    return (a.frameNumber || 0) - (b.frameNumber || 0)
  })

  const rows = frames.map((f) => {
    const r = rollMap.get(f.rollId)
    return [
      r?.name || '',
      f.frameNumber,
      r?.filmStock || '',
      r?.iso ?? '',
      f.shutter || '',
      f.aperture || '',
      f.mode || '',
      f.light || '',
      f.subject || '',
      f.intention || '',
      f.result || '',
      f.lesson || '',
      fmtDate(f.createdAt),
    ]
  })

  return [COLUMNS, ...rows]
    .map((cols) => cols.map(esc).join(','))
    .join('\r\n')
}
