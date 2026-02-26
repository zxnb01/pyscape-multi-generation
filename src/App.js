import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import AlgorithmVisualizer from './pages/AlgorithmVisualizer';
import ProjectLabs from './pages/ProjectLabs';
import CodeDuel from './pages/CodeDuel';
import MLSandbox from './pages/MLSandbox';
import Portfolio from './pages/Portfolio';
import Auth from './pages/Auth';
import SplashScreen from './pages/SplashScreen';
import ProfileBuild from './pages/ProfileBuild';
import TopicSelection from './pages/TopicSelection';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserProfile from './pages/UserProfile';
import AllNews from './pages/AllNews';
import ModulePage from './pages/ModulePage';
import LessonPage from './pages/LessonPage';
import LevelPage from './pages/LevelPage';
import RoadmapPage from './pages/RoadmapPage';

function App() {
  console.log('Environment Variables Check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_SUPABASE_URL exists:', Boolean(process.env.REACT_APP_SUPABASE_URL));
  console.log('REACT_APP_SUPABASE_ANON_KEY exists:', Boolean(process.env.REACT_APP_SUPABASE_ANON_KEY));
  console.log('REACT_APP_RAPIDAPI_KEY exists:', Boolean(process.env.REACT_APP_RAPIDAPI_KEY));
  return (
    <AuthProvider>
      <Routes>
        {/* Splash screen entry */}
        <Route path="/" element={<SplashScreen />} />

        {/* Auth page */}
        <Route path="/auth" element={<Auth />} />

        {/* Profile build (protected) */}
        <Route
          path="/profile-build"
          element={
            <ProtectedRoute>
              <ProfileBuild />
            </ProtectedRoute>
          }
        />

        {/* Topic selection (protected) */}
        <Route
          path="/topic-selection"
          element={
            <ProtectedRoute>
              <TopicSelection />
            </ProtectedRoute>
          }
        />

        {/* Top-level Learn routes (mirror /app/learn/*) so /learn/:moduleId works */}
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:moduleId"
          element={
            <ProtectedRoute>
              <ModulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:moduleId/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/:moduleId/lesson/:lessonId/level/:levelId"
          element={
            <ProtectedRoute>
              <LevelPage />
            </ProtectedRoute>
          }
        />

        {/* Main app with sidebar layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="learn" element={<Learn />} />
          <Route path="learn/:moduleId" element={<ModulePage />} />
          <Route path="learn/:moduleId/lesson/:lessonId" element={<LessonPage />} />
          <Route path="learn/:moduleId/lesson/:lessonId/level/:levelId" element={<LevelPage />} />
          <Route path="roadmap" element={<RoadmapPage />} />
          <Route path="visualizer" element={<AlgorithmVisualizer />} />
          <Route path="projects" element={<ProjectLabs />} />
          <Route path="duel" element={<CodeDuel />} />
          <Route path="sandbox" element={<MLSandbox />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="all-news" element={<AllNews />} />
        </Route>

        {/* Redirects to /app/dashboard instead of 404 for logged-in users */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;                
