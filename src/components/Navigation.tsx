import React from 'react';
import { PenTool, Menu, X } from 'lucide-react';
import UserProfile from './UserProfile';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentPage: string;
  user?: any;
  onShowAuth: () => void;
  onLogout: () => void;
  onNavigateLanding: () => void;
}

export default function Navigation({ 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  currentPage,
  user, 
  onShowAuth, 
  onLogout,
  onNavigateLanding 
}: NavigationProps) {
  
  const handleSectionScroll = (sectionId: string) => {
    if (currentPage !== 'home') {
      onNavigateLanding();
      // Wait for page to load then scroll
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(sectionId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (user) {
      // If logged in, redirect to landing page (logout)
      onLogout();
    } else {
      // If not logged in, go to landing page
      onNavigateLanding();
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={handleLogoClick}>
              <PenTool className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">NotaryPro</span>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="ml-10 flex items-baseline space-x-6">
              {!user && (
                <>
                  <button onClick={() => handleSectionScroll('#hero')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Home</button>
                  <button onClick={() => handleSectionScroll('#features')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</button>
                  <button onClick={() => handleSectionScroll('#security')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Security</button>
                  <button 
                    onClick={onShowAuth}
                    className="text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Login
                  </button>
                </>
              )}
              
              {user ? (
                <UserProfile user={user} onLogout={onLogout} />
              ) : (
                <button 
                  onClick={onShowAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Free Trial
                </button>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!user && (
              <>
                <button onClick={() => handleSectionScroll('#hero')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Home</button>
                <button onClick={() => handleSectionScroll('#features')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Features</button>
                <button onClick={() => handleSectionScroll('#security')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Security</button>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onShowAuth();
                  }}
                  className="w-full text-left text-blue-600 hover:text-blue-700 px-3 py-2 text-base font-medium"
                >
                  Login
                </button>
              </>
            )}
            
            {user ? (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left text-red-600 px-3 py-2 text-base font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onShowAuth();
                }}
                className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-colors mt-2"
              >
                Start Free Trial
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}