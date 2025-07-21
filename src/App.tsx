import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import HomePage from './components/pages/HomePage';
import Dashboard from './components/pages/Dashboard';
import ProfilePage from './components/pages/ProfilePage';
import SettingsPage from './components/pages/SettingsPage';
import PricingPage from './components/pages/PricingPage';
import AuthModal from './components/forms/AuthModal';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  // Handle authentication success
  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
    setCurrentPage('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setCurrentPage('home');
  };

  // Handle navigation to landing page
  const handleNavigateLanding = () => {
    setCurrentPage('home');
  };

  // Auto-redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && currentPage === 'home') {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated, currentPage]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ProtectedRoute isAuthenticated={isAuthenticated} onShowAuth={() => setShowAuthModal(true)}>
            <Dashboard 
              user={user} 
              onUpdateUser={updateUser}
              onLogout={handleLogout}
              currentPageFromApp={currentPage}
              setAppCurrentPage={setCurrentPage}
            />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute isAuthenticated={isAuthenticated} onShowAuth={() => setShowAuthModal(true)}>
            <ProfilePage 
              user={user} 
              onUpdateUser={updateUser}
            />
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute isAuthenticated={isAuthenticated} onShowAuth={() => setShowAuthModal(true)}>
            <SettingsPage 
              user={user} 
              onUpdateUser={updateUser}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        );
      case 'pricing':
        return <PricingPage />;
      default:
        return <HomePage onShowAuth={() => setShowAuthModal(true)} />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onShowAuth={() => setShowAuthModal(true)}
          onLogout={handleLogout}
          onNavigateLanding={handleNavigateLanding}
        />
        
        {renderCurrentPage()}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
}

export default App;