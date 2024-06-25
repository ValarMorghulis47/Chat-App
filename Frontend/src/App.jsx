import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import  ProtectRoute  from './components/auth/ProtectRoute';
import { LayoutLoader } from './components/layout/Loaders';
import { useEffect } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { userExists, userNotExists } from './redux/reducers/auth';
import { useDispatch, useSelector } from 'react-redux';

function App() {
  const Home = lazy(() => import('./pages/Home'));
  const Login = lazy(() => import('./pages/login'));
  const Chat = lazy(() => import('./pages/Chat'));
  const Group = lazy(() => import('./pages/Group'));
  const NotFound = lazy(() => import('./pages/NotFound'));
  const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
  const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
  const ChatManagement = lazy(() => import('./pages/admin/ChatManagement'));
  const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
  const MessageManagement = lazy(() => import('./pages/admin/MessageManagement'));

  const dispatch = useDispatch();

  useEffect(() => {
    axios.get('/api/v1/user/profile', { withCredentials: true}).then(({ data }) => dispatch(userExists(data.user))).catch(() => dispatch(userNotExists()));
  }, [])

  const { user, loader } = useSelector(state => state.auth);

  return loader ? ( <LayoutLoader /> ) : (
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
          <Route path = '/admin/chats' element = {<ChatManagement />} />;
          <Route path = '/admin/users' element = {<UserManagement />} />;
          <Route path = '/admin/messages' element = {<MessageManagement />} />;
          <Route path="*" element={<NotFound />} />;
        </Routes>
      </Suspense>
      <Toaster position='top-right' />
    </Router>
  )
}

export default App