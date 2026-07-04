import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ConnectAccountsPage from './pages/ConnectAccountsPage';
import CreatePostPage from './pages/CreatePostPage';
import LiveStatusPage from './pages/LiveStatusPage';
import PostHistoryPage from './pages/PostHistoryPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="connect" element={<ConnectAccountsPage />} />
          <Route path="create" element={<CreatePostPage />} />
          <Route path="status" element={<LiveStatusPage />} />
          <Route path="history" element={<PostHistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
