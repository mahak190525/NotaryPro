import React from 'react';
import Navigation from './components/layout/Navigation';
import HomePage from './components/pages/HomePage';
import Dashboard from './components/pages/Dashboard';
import PricingPage from './components/pages/PricingPage';
import ProfilePage from './components/pages/ProfilePage';
import SettingsPage from './components/pages/SettingsPage';
import AuthModal from './components/forms/AuthModal';
import { useAuth } from './hooks/useAuth';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('home');
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();

  // Handle authentication success
  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setCurrentPage('dashboard');
    setShowAuthModal(false);
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

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render page content based on current page
  const renderPageContent = () => {
    // Handle profile and settings pages (accessible from anywhere when authenticated)
    if (isAuthenticated && currentPage === 'profile') {
      return <ProfilePage user={user} onUpdateUser={updateUser} />;
    }
    
    if (isAuthenticated && currentPage === 'settings') {
      return <SettingsPage user={user} onUpdateUser={updateUser} onLogout={handleLogout} />;
    }
    
    // If user is authenticated and not on profile/settings, show dashboard
    if (isAuthenticated) {
      return (
        <Dashboard 
          user={user} 
          onUpdateUser={updateUser} 
          onLogout={handleLogout}
          currentPageFromApp={currentPage}
          setAppCurrentPage={setCurrentPage}
        />
      );
    }

    // If not authenticated, show public pages
    switch (currentPage) {
      case 'pricing':
        return <PricingPage />;
      default:
        return <HomePage onShowAuth={() => setShowAuthModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
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
      
      {renderPageContent()}
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;