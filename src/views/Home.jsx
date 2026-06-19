import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="home">
      <h1>Rullino</h1>
      <p>Diario di scatto per fotografia analogica.</p>
      <Link to="/new" className="btn btn-primary">Nuovo scatto</Link>
      <Link to="/rolls" className="btn btn-primary">Rullini</Link>
    </main>
  )
}
