import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActiveRollId, getRoll, countFrames } from '../db/rolls.js'
import { getNextFrameNumber } from '../db/frames.js'
import { getLastBackupAt } from '../db/settings.js'

const BACKUP_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 giorni

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [roll, setRoll] = useState(null)
  const [stats, setStats] = useState({ count: 0, next: 1 })
  const [needsBackup, setNeedsBackup] = useState(false)

  useEffect(() => {
    ;(async () => {
      const activeId = await getActiveRollId()
      const activeRoll = activeId ? await getRoll(activeId) : null
      if (activeRoll) {
        const [count, next] = await Promise.all([
          countFrames(activeRoll.id),
          getNextFrameNumber(activeRoll.id),
        ])
        setRoll(activeRoll)
        setStats({ count, next })
      }
      const last = await getLastBackupAt()
      setNeedsBackup(!last || Date.now() - last > BACKUP_MAX_AGE)
      setLoading(false)
    })()
  }, [])

  return (
    <main className="screen home-screen">
      <h1 className="app-title">Rullino</h1>

      {needsBackup && (
        <Link to="/export" className="backup-reminder">
          ⚠︎ Ricordati di esportare un backup: svuotare i dati del browser
          cancella tutto. Tocca per esportare.
        </Link>
      )}

      {!loading && roll && (
        <section className="card active-card">
          <div className="roll-head">
            <span className="roll-name">{roll.name}</span>
            <span className="badge">ATTIVO</span>
          </div>
          <div className="roll-meta">
            <span>{roll.filmStock || '—'}</span>
            <span>ISO {roll.iso ?? '—'}</span>
          </div>
          <p className="posa-summary">
            Posa corrente <strong>{stats.next}</strong> · {stats.count} pose totali
          </p>
        </section>
      )}

      {!loading && !roll && (
        <section className="card">
          <p>Nessun rullino attivo.</p>
          <Link to="/rolls" className="btn btn-primary">Attiva un rullino</Link>
        </section>
      )}

      {roll && (
        <Link to="/new" className="btn btn-primary btn-save">Nuovo scatto</Link>
      )}

      <nav className="home-nav">
        <Link to="/rolls" className="btn">Rullini</Link>
        <Link to="/frames" className="btn">Scatti</Link>
        <Link to="/export" className="btn">Export</Link>
      </nav>
    </main>
  )
}
