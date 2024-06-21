import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import  ProtectRoute  from './components/auth/ProtectRoute';
import { LayoutLoader } from './components/layout/Loaders';

function App() {
  const Home = lazy(() => import('./pages/Home'));
  const Login = lazy(() => import('./pages/login'));
  const Chat = lazy(() => import('./pages/Chat'));
  const Group = lazy(() => import('./pages/Group'));
  const NotFound = lazy(() => import('./pages/NotFound'));
  const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
  const Dashboard = lazy(() => import('./pages/admin/Dashboard'));

  let user = true;

  return (
    <Router>
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          <Route element={<ProtectRoute user={user} />}>
            <Route path="/" element={<Home />} />;
            <Route path="/chat/:chatId" element={<Chat />} />;
            <Route path="/group" element={<Group />} />;
          </Route>;
          <Route path='/login' element={
            <ProtectRoute user={!user} redirect='/'>
              <Login />
            </ProtectRoute>
          } />;
          <Route path = '/admin' element = {<AdminLogin />} />;
          <Route path = '/admin/dashboard' element = {<Dashboard />} />;
          <Route path="*" element={<NotFound />} />;
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App