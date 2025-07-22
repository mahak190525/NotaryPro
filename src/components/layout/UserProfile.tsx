import React, { useState } from 'react';
import { User, Settings, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

interface UserProfileProps {
  user: any;
  onLogout: () => void;
  onNavigateProfile?: (page: string) => void;
  onNavigateSettings?: (page: string) => void;
}

export default function UserProfile({ user, onLogout, onNavigateProfile, onNavigateSettings }: UserProfileProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  React.useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user?.id) return;

      try {
        let userData;
        
        if (user.provider === 'google') {
          // For Google users, get avatar from google_users table using uuid_id
          const { data: googleUserData, error: googleError } = await supabase
            .from('google_users')
            .select('avatar_url')
            .eq('uuid_id', user.id)
            .single();

          if (!googleError && googleUserData) {
            userData = googleUserData;
          }
        } else {
          // For email users, get avatar from users table
          const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('avatar_url')
            .eq('id', user.id)
            .single();

          if (!userError && userRecord) {
            userData = userRecord;
          }
        }

        if (userData?.avatar_url) {
          setAvatarUrl(userData.avatar_url);
        }
      } catch (error) {
        console.error('Error loading user avatar:', error);
      }
    };

    loadUserAvatar();
  }, [user]);

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
          src={avatarUrl || user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=3b82f6&color=fff&size=32`}
          alt={`${user.firstName} ${user.lastName}`}
          className="w-8 h-8 rounded-full border-2 border-solid border-gray-400"
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
          
          <button 
            onClick={() => {
              setShowDropdown(false);
              onNavigateProfile?.();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <UserCircle className="h-4 w-4 mr-3" />
            Profile
          </button>

          <button 
            onClick={() => {
              setShowDropdown(false);
              onNavigateSettings?.();
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
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