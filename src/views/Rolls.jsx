import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  createRoll,
  getAllRolls,
  updateRoll,
  setRollStatus,
  countFrames,
  getActiveRollId,
  setActiveRoll,
} from '../db/rolls.js'
import { ROLL_STATUSES, DEFAULT_CAMERA, DEFAULT_LENS } from '../constants.js'

const STATUS_LABELS = {
  in_corso: 'In corso',
  da_sviluppare: 'Da sviluppare',
  sviluppato: 'Sviluppato',
  scansionato: 'Scansionato',
  archiviato: 'Archiviato',
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function emptyForm() {
  return {
    name: '',
    camera: DEFAULT_CAMERA,
    lens: DEFAULT_LENS,
    filmStock: '',
    iso: '',
    startDate: today(),
    notes: '',
  }
}

export default function Rolls() {
  const [rolls, setRolls] = useState([])
  const [counts, setCounts] = useState({})
  const [activeId, setActiveId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm())

  const load = useCallback(async () => {
    const [list, active] = await Promise.all([getAllRolls(), getActiveRollId()])
    setRolls(list)
    setActiveId(active)
    const entries = await Promise.all(
      list.map(async (r) => [r.id, await countFrames(r.id)]),
    )
    setCounts(Object.fromEntries(entries))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
  }

  function openEdit(roll) {
    setEditingId(roll.id)
    setForm({
      name: roll.name || '',
      camera: roll.camera || DEFAULT_CAMERA,
      lens: roll.lens || DEFAULT_LENS,
      filmStock: roll.filmStock || '',
      iso: roll.iso ?? '',
      startDate: roll.startDate || today(),
      notes: roll.notes || '',
    })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  function setField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) {
      await updateRoll(editingId, form)
    } else {
      await createRoll(form)
    }
    closeForm()
    await load()
  }

  async function handleSetActive(id) {
    await setActiveRoll(id)
    await load()
  }

  async function handleStatusChange(id, status) {
    await setRollStatus(id, status)
    await load()
  }

  return (
    <main className="screen">
      <header className="topbar">
        <Link to="/" className="back">← Home</Link>
        <h1>Rullini</h1>
      </header>

      {!showForm && (
        <button className="btn btn-primary" onClick={openCreate}>
          + Nuovo rullino
        </button>
      )}

      {showForm && (
        <form className="card form" onSubmit={handleSubmit}>
          <h2>{editingId ? 'Modifica rullino' : 'Nuovo rullino'}</h2>

          <label>
            Nome
            <input
              type="text"
              placeholder="es. R03"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              autoFocus
              required
            />
          </label>

          <label>
            Camera
            <input
              type="text"
              value={form.camera}
              onChange={(e) => setField('camera', e.target.value)}
            />
          </label>

          <label>
            Obiettivo
            <input
              type="text"
              value={form.lens}
              onChange={(e) => setField('lens', e.target.value)}
            />
          </label>

          <label>
            Pellicola
            <input
              type="text"
              placeholder="es. Kodak Gold 200"
              value={form.filmStock}
              onChange={(e) => setField('filmStock', e.target.value)}
            />
          </label>

          <label>
            ISO
            <input
              type="number"
              inputMode="numeric"
              placeholder="es. 200"
              value={form.iso}
              onChange={(e) => setField('iso', e.target.value)}
            />
          </label>

          <label>
            Data inizio
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
            />
          </label>

          <label>
            Note (opzionale)
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setField('notes', e.target.value)}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn" onClick={closeForm}>
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Salva modifiche' : 'Crea rullino'}
            </button>
          </div>
        </form>
      )}

      {rolls.length === 0 && !showForm && (
        <p className="empty">Nessun rullino. Creane uno per iniziare.</p>
      )}

      <ul className="roll-list">
        {rolls.map((roll) => {
          const isActive = roll.id === activeId
          return (
            <li
              key={roll.id}
              className={`card roll-card${isActive ? ' active' : ''}`}
            >
              <div className="roll-head">
                <Link to={`/rolls/${roll.id}`} className="roll-name roll-link">
                  {roll.name || '(senza nome)'} ›
                </Link>
                {isActive && <span className="badge">ATTIVO</span>}
              </div>

              <div className="roll-meta">
                <span>{roll.filmStock || '—'}</span>
                <span>ISO {roll.iso ?? '—'}</span>
                <span>{counts[roll.id] ?? 0} scatti</span>
              </div>

              <label className="status-row">
                Stato
                <select
                  value={roll.status}
                  onChange={(e) => handleStatusChange(roll.id, e.target.value)}
                >
                  {ROLL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s] || s}
                    </option>
                  ))}
                </select>
              </label>

              <div className="roll-actions">
                <button
                  className="btn"
                  disabled={isActive}
                  onClick={() => handleSetActive(roll.id)}
                >
                  {isActive ? 'Attivo' : 'Imposta attivo'}
                </button>
                <button className="btn" onClick={() => openEdit(roll)}>
                  Modifica
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
