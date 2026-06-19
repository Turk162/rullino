import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllRolls, getActiveRollId } from '../db/rolls.js'
import { getFramesByRoll } from '../db/frames.js'

function fmtDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function Frames() {
  const [rolls, setRolls] = useState([])
  const [rollId, setRollId] = useState('')
  const [frames, setFrames] = useState([])
  const [loading, setLoading] = useState(true)

  // Carica i rullini e preseleziona quello attivo (o il primo).
  useEffect(() => {
    ;(async () => {
      const [list, activeId] = await Promise.all([getAllRolls(), getActiveRollId()])
      setRolls(list)
      const initial = list.find((r) => r.id === activeId)?.id || list[0]?.id || ''
      setRollId(initial)
      setLoading(false)
    })()
  }, [])

  // Carica gli scatti del rullino selezionato.
  useEffect(() => {
    if (!rollId) {
      setFrames([])
      return
    }
    getFramesByRoll(rollId).then(setFrames)
  }, [rollId])

  const roll = rolls.find((r) => r.id === rollId)

  return (
    <main className="screen">
      <header className="topbar">
        <Link to="/" className="back">← Home</Link>
        <h1>Scatti</h1>
      </header>

      {!loading && rolls.length === 0 && (
        <p className="empty">Nessun rullino. Creane uno per iniziare.</p>
      )}

      {rolls.length > 0 && (
        <label className="status-row">
          Rullino
          <select value={rollId} onChange={(e) => setRollId(e.target.value)}>
            {rolls.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
      )}

      {roll && (
        <div className="roll-meta">
          <span>{roll.filmStock || '—'}</span>
          <span>ISO {roll.iso ?? '—'}</span>
          <span>{frames.length} scatti</span>
        </div>
      )}

      {roll && frames.length === 0 && (
        <p className="empty">Nessuno scatto su questo rullino.</p>
      )}

      <ul className="frame-list">
        {frames.map((f) => (
          <li key={f.id} className="card frame-detail">
            <div className="frame-detail-head">
              <span className="frame-num">#{f.frameNumber}</span>
              <span className="frame-exp">
                {f.shutter || '—'} · {f.aperture || '—'} · {f.mode}
              </span>
              <Link to={`/frames/${f.id}`} className="frame-edit-link">Modifica</Link>
            </div>

            <dl className="frame-fields">
              {f.light && (<><dt>Luce</dt><dd>{f.light}</dd></>)}
              {f.subject && (<><dt>Soggetto</dt><dd>{f.subject}</dd></>)}
              {f.intention && (<><dt>Intenzione</dt><dd>{f.intention}</dd></>)}
              {f.tags?.length > 0 && (<><dt>Tag</dt><dd>{f.tags.join(', ')}</dd></>)}
              {f.result && (<><dt>Esito</dt><dd>{f.result}</dd></>)}
              {f.lesson && (<><dt>Lezione</dt><dd>{f.lesson}</dd></>)}
              <dt>Data</dt><dd>{fmtDate(f.createdAt)}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </main>
  )
}
