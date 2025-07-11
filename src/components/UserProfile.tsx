import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface UserProfileProps {
  user: any;
  onLogout: () => void;
}

export default function UserProfile({ user, onLogout }: UserProfileProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = () => {
    setShowDropdown(false);
    onLogout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img
          src={user.avatar}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-8 h-8 rounded-full"
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-gray-500">{user.businessName}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
            <User className="h-4 w-4 mr-3" />
            Profile
          </button>
          
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center">
            <Settings className="h-4 w-4 mr-3" />
            Settings
          </button>
          
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}