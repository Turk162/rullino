import { Routes, Route } from 'react-router-dom'
import Home from './views/Home.jsx'
import Rolls from './views/Rolls.jsx'
import RollDetail from './views/RollDetail.jsx'
import NewFrame from './views/NewFrame.jsx'
import Frames from './views/Frames.jsx'
import FrameEdit from './views/FrameEdit.jsx'
import Export from './views/Export.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rolls" element={<Rolls />} />
      <Route path="/rolls/:id" element={<RollDetail />} />
      <Route path="/new" element={<NewFrame />} />
      <Route path="/frames" element={<Frames />} />
      <Route path="/frames/:id" element={<FrameEdit />} />
      <Route path="/export" element={<Export />} />
    </Routes>
  )
}
