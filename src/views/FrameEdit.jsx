import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ButtonGrid from '../components/ButtonGrid.jsx'
import { getFrame, updateFrame, deleteFrame } from '../db/frames.js'
import { getRoll } from '../db/rolls.js'
import { SHUTTER_SPEEDS, APERTURES, MODES, TAGS } from '../constants.js'

export default function FrameEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [frame, setFrame] = useState(null)
  const [rollId, setRollId] = useState(null)

  const [frameNumber, setFrameNumber] = useState(1)
  const [shutter, setShutter] = useState(null)
  const [aperture, setAperture] = useState(null)
  const [mode, setMode] = useState('AE')
  const [light, setLight] = useState('')
  const [subject, setSubject] = useState('')
  const [intention, setIntention] = useState('')
  const [tags, setTags] = useState([])
  const [result, setResult] = useState('')
  const [lesson, setLesson] = useState('')

  useEffect(() => {
    ;(async () => {
      const f = await getFrame(id)
      if (f) {
        setFrame(f)
        setRollId(f.rollId)
        setFrameNumber(f.frameNumber)
        setShutter(f.shutter || null)
        setAperture(f.aperture || null)
        setMode(f.mode || 'AE')
        setLight(f.light || '')
        setSubject(f.subject || '')
        setIntention(f.intention || '')
        setTags(f.tags || [])
        setResult(f.result || '')
        setLesson(f.lesson || '')
      }
      setLoading(false)
    })()
  }, [id])

  function toggleTag(tag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  async function handleSave() {
    await updateFrame(id, {
      frameNumber, shutter, aperture, mode,
      light, subject, intention, tags, result, lesson,
    })
    navigate(`/rolls/${rollId}`)
  }

  async function handleDelete() {
    if (!window.confirm(`Eliminare la posa #${frameNumber}? L'azione è irreversibile.`)) return
    await deleteFrame(id)
    navigate(`/rolls/${rollId}`)
  }

  if (loading) {
    return (
      <main className="screen">
        <p className="empty">Caricamento…</p>
      </main>
    )
  }

  if (!frame) {
    return (
      <main className="screen">
        <header className="topbar">
          <Link to="/rolls" className="back">← Rullini</Link>
          <h1>Scatto</h1>
        </header>
        <p className="empty">Scatto non trovato.</p>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="topbar">
        <Link to={`/rolls/${rollId}`} className="back">← Rullino</Link>
        <h1>Posa #{frameNumber}</h1>
      </header>

      <section className="field">
        <h2>Posa</h2>
        <input
          className="posa-input"
          type="number"
          inputMode="numeric"
          value={frameNumber}
          onChange={(e) => setFrameNumber(Number(e.target.value))}
        />
      </section>

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

      <div className="details">
        <label>
          Luce
          <input type="text" value={light} onChange={(e) => setLight(e.target.value)} />
        </label>
        <label>
          Soggetto
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </label>
        <label>
          Intenzione
          <input type="text" value={intention} onChange={(e) => setIntention(e.target.value)} />
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
        <label>
          Esito
          <textarea rows={2} value={result} onChange={(e) => setResult(e.target.value)} />
        </label>
        <label>
          Lezione
          <textarea rows={2} value={lesson} onChange={(e) => setLesson(e.target.value)} />
        </label>
      </div>

      <button type="button" className="btn btn-primary btn-save" onClick={handleSave}>
        Salva modifiche
      </button>
      <button type="button" className="btn btn-danger" onClick={handleDelete}>
        Elimina scatto
      </button>
    </main>
  )
}
