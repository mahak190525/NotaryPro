import React from 'react';
import { PenTool, Menu, X } from 'lucide-react';

interface NavigationProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Navigation({ mobileMenuOpen, setMobileMenuOpen }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <PenTool className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">NotaryPro</span>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
              <a href="#automation" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Automation</a>
              <a href="#pricing" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
              <a href="#security" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Security</a>
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
            <a href="#features" className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium">Features</a>
            <a href="#automation" className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium">Automation</a>
            <a href="#pricing" className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium">Pricing</a>
            <a href="#security" className="text-gray-600 hover:text-blue-600 block px-3 py-2 text-base font-medium">Security</a>
            <button className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-base font-medium transition-colors mt-2">
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}