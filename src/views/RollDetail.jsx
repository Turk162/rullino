import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getRoll } from '../db/rolls.js'
import { getFramesByRoll } from '../db/frames.js'

const STATUS_LABELS = {
  in_corso: 'In corso',
  da_sviluppare: 'Da sviluppare',
  sviluppato: 'Sviluppato',
  scansionato: 'Scansionato',
  archiviato: 'Archiviato',
}

export default function RollDetail() {
  const { id } = useParams()
  const [roll, setRoll] = useState(null)
  const [frames, setFrames] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const [r, f] = await Promise.all([getRoll(id), getFramesByRoll(id)])
    setRoll(r)
    setFrames(f)
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

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
          <Link to="/rolls" className="back">← Rullini</Link>
          <h1>Rullino</h1>
        </header>
        <p className="empty">Rullino non trovato.</p>
      </main>
    )
  }

  return (
    <main className="screen">
      <header className="topbar">
        <Link to="/rolls" className="back">← Rullini</Link>
        <h1>{roll.name}</h1>
      </header>

      <div className="roll-meta">
        <span>{roll.filmStock || '—'}</span>
        <span>ISO {roll.iso ?? '—'}</span>
        <span>{STATUS_LABELS[roll.status] || roll.status}</span>
        <span>{frames.length} scatti</span>
      </div>

      {frames.length === 0 ? (
        <p className="empty">Nessuno scatto su questo rullino.</p>
      ) : (
        <ul className="frame-list">
          {frames.map((f) => (
            <li key={f.id}>
              <Link to={`/frames/${f.id}`} className="frame-row">
                <span className="frame-num">#{f.frameNumber}</span>
                <span className="frame-exp">
                  {f.shutter || '—'} · {f.aperture || '—'}
                </span>
                <span className="frame-tags">
                  {(f.tags || []).join(', ')}
                </span>
                <span className="frame-chevron">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
