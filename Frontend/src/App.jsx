import React, {lazy, Suspense} from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

function App() {
  const Home = lazy(() => import('./pages/Home'))
  const Login = lazy(() => import('./pages/login'))
  const Chat = lazy(() => import('./pages/Chat'))
  const Group = lazy(() => import('./pages/Group'))

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/group" element={<Group />} />
          <Route path="*" element={<h1>Not Found</h1>} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App