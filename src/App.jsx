import { Routes, Route } from 'react-router-dom'
import Home from './views/Home.jsx'
import Rolls from './views/Rolls.jsx'
import NewFrame from './views/NewFrame.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rolls" element={<Rolls />} />
      <Route path="/new" element={<NewFrame />} />
    </Routes>
  )
}
