import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllRolls } from '../db/rolls.js'
import { setLastBackupAt } from '../db/settings.js'
import { buildCsv } from '../utils/exportCsv.js'
import { buildBackup } from '../utils/exportJson.js'
import { parseBackup, applyBackup } from '../utils/importJson.js'
import { downloadFile } from '../utils/download.js'

function stamp() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

export default function Export() {
  const [rolls, setRolls] = useState([])
  const [csvRollId, setCsvRollId] = useState('')
  const [pending, setPending] = useState(null) // backup in attesa di conferma
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    getAllRolls().then(setRolls)
  }, [])

  async function handleExportCsv() {
    const csv = await buildCsv(csvRollId || null)
    const suffix = csvRollId
      ? (rolls.find((r) => r.id === csvRollId)?.name || 'rullino')
      : 'tutti'
    downloadFile(`rullino-${suffix}-${stamp()}.csv`, csv, 'text/csv;charset=utf-8')
  }

  async function handleExportJson() {
    const backup = await buildBackup()
    downloadFile(
      `rullino-backup-${stamp()}.json`,
      JSON.stringify(backup, null, 2),
      'application/json',
    )
    await setLastBackupAt(Date.now())
    setMsg('Backup JSON esportato ✓')
  }

  async function handleFile(e) {
    setError('')
    setMsg('')
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = parseBackup(await file.text())
      setPending(data)
    } catch (err) {
      setError(err.message || 'File non valido.')
      setPending(null)
    }
  }

  async function handleApply(mode) {
    try {
      await applyBackup(pending, mode)
      setMsg(
        mode === 'replace'
          ? 'Backup ripristinato (sostituzione completa) ✓'
          : 'Backup unito ai dati esistenti ✓',
      )
    } catch (err) {
      setError(err.message || 'Import fallito.')
    } finally {
      setPending(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function cancelImport() {
    setPending(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <main className="screen">
      <header className="topbar">
        <Link to="/" className="back">← Home</Link>
        <h1>Export / Backup</h1>
      </header>

      <section className="card">
        <h2>Esporta CSV</h2>
        <label className="status-row">
          Rullino
          <select value={csvRollId} onChange={(e) => setCsvRollId(e.target.value)}>
            <option value="">Tutti i rullini</option>
            {rolls.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" onClick={handleExportCsv}>
          Esporta CSV
        </button>
      </section>

      <section className="card">
        <h2>Backup JSON</h2>
        <p className="hint" style={{ textAlign: 'left' }}>
          Salva tutto (rullini + scatti). Re-importabile per ripristino.
        </p>
        <button className="btn btn-primary" onClick={handleExportJson}>
          Esporta JSON
        </button>
      </section>

      <section className="card">
        <h2>Importa JSON</h2>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFile}
        />
        {pending && (
          <div className="import-confirm">
            <p>
              Trovati <strong>{pending.rolls.length}</strong> rullini e{' '}
              <strong>{pending.frames.length}</strong> scatti. Come procedere?
            </p>
            <div className="form-actions">
              <button className="btn btn-danger" onClick={() => handleApply('replace')}>
                Sostituisci tutto
              </button>
              <button className="btn btn-primary" onClick={() => handleApply('merge')}>
                Unisci
              </button>
            </div>
            <button className="btn" onClick={cancelImport}>Annulla</button>
          </div>
        )}
      </section>

      {error && <p className="error-msg">{error}</p>}
      {msg && <p className="saved-msg">{msg}</p>}
    </main>
  )
}
