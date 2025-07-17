import React from 'react';
import { 
  Receipt, 
  PenTool, 
  Car, 
  FileText, 
  Zap, 
  Download, 
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User,
  Settings
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ isCollapsed, setIsCollapsed, currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'receipts', label: 'Receipt Management', icon: Receipt, path: '/receipts' },
    { id: 'journal', label: 'Electronic Journal', icon: PenTool, path: '/journal' },
    { id: 'mileage', label: 'Mileage Tracker', icon: Car, path: '/mileage' },
    { id: 'reports', label: 'Mileage Reports', icon: BarChart3, path: '/reports' },
    { id: 'automation', label: 'Automation', icon: Zap, path: '/automation' },
    { id: 'import-orders', label: 'Import Orders', icon: Download, path: '/import-orders' },
    // { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    // { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }, 
  ];

  const handleNavigation = (path: string) => {
    onNavigate(path === '/dashboard' ? 'dashboard' : path.substring(1));
  };

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-screen sticky top-16 z-40`}>
      {/* Toggle Button */}
      <div className="flex justify-end p-2 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          )}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-1">Need Help?</p>
            <p className="text-xs text-blue-700 mb-2">Contact our support team</p>
            <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">
              Get Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}