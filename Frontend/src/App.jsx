import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import  ProtectRoute  from './components/auth/ProtectRoute';

function App() {
  const Home = lazy(() => import('./pages/Home'))
  const Login = lazy(() => import('./pages/login'))
  const Chat = lazy(() => import('./pages/Chat'))
  const Group = lazy(() => import('./pages/Group'))
  const NotFound = lazy(() => import('./pages/NotFound'))

  let user = true;

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route element={<ProtectRoute user={user} />}>
            <Route path="/" element={<Home />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/group" element={<Group />} />
          </Route>
          <Route path='/login' element={
            <ProtectRoute user={!user} redirect='/'>
              <Login />
            </ProtectRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App