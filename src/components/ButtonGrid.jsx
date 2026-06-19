// Griglia di bottoni a selezione singola (tempo, diaframma). Un tap seleziona.
export default function ButtonGrid({ options, value, onChange }) {
  return (
    <div className="btn-grid">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`grid-btn${value === opt ? ' selected' : ''}`}
          aria-pressed={value === opt}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
