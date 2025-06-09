import React from 'react';
import { PenTool, Menu, X } from 'lucide-react';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  const handleNavigation = (path: string) => {
    if (path.startsWith('#')) {
      // Scroll to section on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/' + path;
      } else {
        const element = document.querySelector(path);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to different page
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
              <PenTool className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">NotaryPro</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => handleNavigation('#features')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</button>
              <button onClick={() => handleNavigation('/automation')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Automation</button>
              <button onClick={() => handleNavigation('/mileage')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Mileage</button>
              <button onClick={() => handleNavigation('/journal')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Journal</button>
              <button onClick={() => handleNavigation('/receipts')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Receipts</button>
              <button onClick={() => handleNavigation('/reports')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Reports</button>
              <button onClick={() => handleNavigation('/pricing')} className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Start Free Trial
              </button>
            </div>
          </div>

          <div className="md:hidden">
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
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNavigation('#features')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Features</button>
            <button onClick={() => handleNavigation('/automation')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Automation</button>
            <button onClick={() => handleNavigation('/mileage')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Mileage</button>
            <button onClick={() => handleNavigation('/journal')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Journal</button>
            <button onClick={() => handleNavigation('/receipts')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Receipts</button>
            <button onClick={() => handleNavigation('/reports')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Reports</button>
            <button onClick={() => handleNavigation('/pricing')} className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium w-full text-left">Pricing</button>
            <button className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-colors mt-2">
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}