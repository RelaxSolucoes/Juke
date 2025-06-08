import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PartyProvider } from './contexts/PartyContext';
import { PlanProvider } from './contexts/PlanContext';
import { LoginScreen } from './components/LoginScreen';
import { HostDashboard } from './components/HostDashboard';
import { GuestView } from './components/GuestView';
import { SpotifyCallback } from './components/SpotifyCallback';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { user, isHost } = useAuth();

  if (!user) {
    return <LoginScreen />;
  }

  return isHost ? <HostDashboard /> : <GuestView />;
};

function App() {
  return (
    <ErrorBoundary>
      <PlanProvider>
        <Router>
          <AuthProvider>
            <PartyProvider>
              <Routes>
                <Route path="/callback" element={<SpotifyCallback />} />
                <Route path="/" element={<AppContent />} />
              </Routes>
            </PartyProvider>
          </AuthProvider>
        </Router>
      </PlanProvider>
    </ErrorBoundary>
  );
}

export default App;