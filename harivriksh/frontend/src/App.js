import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PlantsPage from './pages/PlantsPage';
import PlantDetailPage from './pages/PlantDetailPage';
import ContainerMatcherPage from './pages/ContainerMatcherPage';
import SoilGuidePage from './pages/SoilGuidePage';
import CommunityPage from './pages/CommunityPage';
import PostDetailPage, { NewPostPage } from './pages/PostDetailPage';
import MyGardenPage from './pages/MyGardenPage';
import RemindersPage from './pages/RemindersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AIChatbot from './components/AIChatbot';
import AIDoctorPage from './pages/AIDoctorPage';
import DashboardPage from './pages/DashboardPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" style={{ width: 40, height: 40 }}></div></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto' }}></div>
      </div>
    </div>
  );
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/plants" element={<PlantsPage />} />
          <Route path="/plants/:id" element={<PlantDetailPage />} />
          <Route path="/container-matcher" element={<ContainerMatcherPage />} />
          <Route path="/soil-guide" element={<SoilGuidePage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/new" element={<PrivateRoute><NewPostPage /></PrivateRoute>} />
          <Route path="/community/:id" element={<PostDetailPage />} />
          <Route path="/my-garden" element={<PrivateRoute><MyGardenPage /></PrivateRoute>} />
          <Route path="/reminders" element={<PrivateRoute><RemindersPage /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/ai-doctor" element={<AIDoctorPage />} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <AIChatbot />
    </>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'var(--font-body)', fontSize: 14 } }} />
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
