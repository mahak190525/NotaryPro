import React from 'react';
import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Dashboard from './components/Dashboard';
import PricingPage from './components/PricingPage';
import AuthModal from './components/AuthModal';
import { useAuth } from './hooks/useAuth';

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState('home');
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

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
    // If user is authenticated, always show dashboard
    if (isAuthenticated) {
      return <Dashboard user={user} />;
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