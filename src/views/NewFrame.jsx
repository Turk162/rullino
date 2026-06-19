import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ButtonGrid from '../components/ButtonGrid.jsx'
import { getActiveRollId, getRoll } from '../db/rolls.js'
import { createFrame, getNextFrameNumber, getLastFrame } from '../db/frames.js'
import { SHUTTER_SPEEDS, APERTURES, MODES, TAGS } from '../constants.js'

export default function NewFrame() {
  const [loading, setLoading] = useState(true)
  const [roll, setRoll] = useState(null)

  const [frameNumber, setFrameNumber] = useState(1)
  const [editingNumber, setEditingNumber] = useState(false)
  const [shutter, setShutter] = useState(null)
  const [aperture, setAperture] = useState(null)
  const [mode, setMode] = useState('AE')

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [light, setLight] = useState('')
  const [subject, setSubject] = useState('')
  const [intention, setIntention] = useState('')
  const [tags, setTags] = useState([])

  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const activeId = await getActiveRollId()
    const activeRoll = activeId ? await getRoll(activeId) : null
    if (!activeRoll) {
      setRoll(null)
      setLoading(false)
      return
    }
    const [next, last] = await Promise.all([
      getNextFrameNumber(activeRoll.id),
      getLastFrame(activeRoll.id),
    ])
    setRoll(activeRoll)
    setFrameNumber(next)
    if (last) {
      setShutter(last.shutter || null)
      setAperture(last.aperture || null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function toggleTag(tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  function resetOptional() {
    setLight('')
    setSubject('')
    setIntention('')
    setTags([])
    setDetailsOpen(false)
  }

  async function handleSave() {
    if (!roll || !shutter) return
    await createFrame({
      rollId: roll.id,
      frameNumber,
      shutter,
      aperture,
      mode,
      light,
      subject,
      intention,
      tags,
    })
    // Mantieni tempo/diaframma/modo (scatti consecutivi spesso li condividono),
    // azzera gli opzionali e incrementa la posa.
    resetOptional()
    const next = await getNextFrameNumber(roll.id)
    setFrameNumber(next)
    setEditingNumber(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  if (loading) {
    return (
      <main className="screen">
        <p className="empty">Caricamento…</p>
      </main>
    )
  }

  if (!roll) {
    return (
      <main className="screen">
        <header className="topbar">
          <Link to="/" className="back">← Home</Link>
          <h1>Nuovo scatto</h1>
        </header>
        <p className="empty">
          Nessun rullino attivo. Imposta un rullino come attivo per registrare
          gli scatti.
        </p>
        <Link to="/rolls" className="btn btn-primary">Vai ai Rullini</Link>
      </main>
    )
  }

  // Solo il tempo è obbligatorio. In AE il diaframma lo sceglie la macchina
  // e non sempre è leggibile al momento: un diaframma vuoto è legittimo.
  const canSave = !!shutter

  return (
    <main className="screen">
      <header className="topbar">
        <Link to="/" className="back">← Home</Link>
        <h1>Nuovo scatto</h1>
      </header>

      <p className="active-roll">
        {roll.name} · {roll.filmStock || '—'} · ISO {roll.iso ?? '—'}
      </p>

      <div className="posa">
        <span className="posa-label">Posa</span>
        {editingNumber ? (
          <input
            className="posa-input"
            type="number"
            inputMode="numeric"
            value={frameNumber}
            autoFocus
            onChange={(e) => setFrameNumber(Number(e.target.value))}
            onBlur={() => setEditingNumber(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingNumber(false)}
          />
        ) : (
          <button
            className="posa-num"
            type="button"
            onClick={() => setEditingNumber(true)}
            aria-label="Modifica numero posa"
          >
            {frameNumber}
          </button>
        )}
      </div>

      <section className="field">
        <h2>Tempo</h2>
        <ButtonGrid options={SHUTTER_SPEEDS} value={shutter} onChange={setShutter} />
      </section>

      <section className="field">
        <h2>Diaframma</h2>
        <ButtonGrid options={APERTURES} value={aperture} onChange={setAperture} />
      </section>

      <section className="field">
        <h2>Modo</h2>
        <div className="toggle">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`toggle-btn${mode === m ? ' selected' : ''}`}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </section>

      <section className="field">
        <button
          type="button"
          className="details-toggle"
          aria-expanded={detailsOpen}
          onClick={() => setDetailsOpen((o) => !o)}
        >
          {detailsOpen ? '▾' : '▸'} Dettagli
        </button>

        {detailsOpen && (
          <div className="details">
            <label>
              Luce
              <input
                type="text"
                value={light}
                onChange={(e) => setLight(e.target.value)}
              />
            </label>
            <label>
              Soggetto
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </label>
            <label>
              Intenzione
              <input
                type="text"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
              />
            </label>
            <div className="tags-block">
              <span className="tags-label">Tag</span>
              <div className="tags">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`chip${tags.includes(tag) ? ' selected' : ''}`}
                    aria-pressed={tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      <button
        type="button"
        className="btn btn-primary btn-save"
        disabled={!canSave}
        onClick={handleSave}
      >
        Salva scatto
      </button>
      {!canSave && (
        <p className="hint">Seleziona il tempo per salvare. Il diaframma è opzionale.</p>
      )}
      {saved && <p className="saved-msg">Scatto salvato ✓</p>}
    </main>
  )
}
