import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Building, Edit3, Save, X, Camera, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

interface ProfilePageProps {
  user: any;
  onUpdateUser: (updates: any) => void;
}

export default function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    licenseNumber: '',
    commissionExpiration: '',
    avatar: ''
  });
  const [originalData, setOriginalData] = useState(profileData);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [pendingAvatarPreview, setPendingAvatarPreview] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackToDashboard = () => {
    // Navigate back to dashboard - this will be handled by the parent component
    window.location.href = '/'; // This will trigger the app to show dashboard for logged-in users
  };

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Try to get data from the users table first
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If not found in users table, try google_users table
      if (userError && user.provider === 'google') {
        const { data: googleUserData, error: googleError } = await supabase
          .from('google_users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!googleError && googleUserData) {
          userData = {
            id: googleUserData.id,
            email: googleUserData.email,
            first_name: googleUserData.first_name,
            last_name: googleUserData.last_name,
            business_name: googleUserData.business_name,
            phone: googleUserData.phone,
            address: googleUserData.address,
            city: googleUserData.city,
            state: googleUserData.state,
            zip_code: googleUserData.zip_code,
            license_number: googleUserData.license_number,
            commission_expiration: googleUserData.commission_expiration,
            avatar_url: googleUserData.avatar_url,
            created_at: googleUserData.created_at
          };
        }
      }

      if (userData) {
        const data = {
          firstName: userData.first_name || user.firstName || '',
          lastName: userData.last_name || user.lastName || '',
          email: userData.email || user.email || '',
          businessName: userData.business_name || user.businessName || '',
          phone: userData.phone || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          zipCode: userData.zip_code || '',
          licenseNumber: userData.license_number || '',
          commissionExpiration: userData.commission_expiration || '',
          avatar: userData.avatar_url || user.avatar || ''
        };
        setProfileData(data);
        setOriginalData(data);
        
        // Set member since date
        if (userData.created_at) {
          setMemberSince(new Date(userData.created_at).toLocaleDateString());
        }
      } else {
        // Fallback to user object data
        const data = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          businessName: user.businessName || '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          licenseNumber: '',
          commissionExpiration: '',
          avatar: user.avatar || ''
        };
        setProfileData(data);
        setOriginalData(data);
        
        // Fallback member since
        setMemberSince('Recently joined');
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatarToStorage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const safeUserId = user.id.toString().replace(/[^a-zA-Z0-9]/g, '_');
      const newFilePath = `${safeUserId}.${fileExt}`;

      console.log('Uploading file with path:', newFilePath);
      
      // First, list all existing files for this user to delete them
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('avatar-images')
        .list('', {
          search: safeUserId
        });

      if (listError) {
        console.warn('Could not list existing files:', listError.message);
      } else if (existingFiles && existingFiles.length > 0) {
        const userFiles = existingFiles.filter(file => 
          file.name.startsWith(safeUserId + '.') || file.name === safeUserId
        );
        
        if (userFiles.length > 0) {
          const filesToDelete = userFiles.map(file => file.name);
          const { error: deleteError } = await supabase.storage
            .from('avatar-images')
            .remove(filesToDelete);

          if (deleteError) {
            console.warn('Could not delete some existing files:', deleteError.message);
          }
        }
      }
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatar-images')
        .upload(newFilePath, file, {
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error('Failed to upload image:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatar-images')
        .getPublicUrl(newFilePath);

      return publicUrlData?.publicUrl || null;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);

      let avatarUrl = profileData.avatar;

      // Upload new avatar if there's a pending file
      if (pendingAvatarFile) {
        try {
          const uploadedUrl = await uploadAvatarToStorage(pendingAvatarFile);
          if (uploadedUrl) {
            avatarUrl = uploadedUrl;
          }
        } catch (uploadError) {
          console.error('Avatar upload failed:', uploadError);
          alert('Failed to upload avatar image. Profile will be saved without the new image.');
        }
      }

      // Prepare the update data
      const updateData = {
        id: user.id,
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        email: profileData.email,
        business_name: profileData.businessName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zipCode,
        license_number: profileData.licenseNumber,
        commission_expiration: profileData.commissionExpiration || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };

      let error;

      // Update the appropriate table based on user provider
      if (user.provider === 'google') {
        const { error: googleError } = await supabase
          .from('google_users')
          .upsert(updateData)
          .eq('id', user.id);
        error = googleError;
      } else {
        const { error: userError } = await supabase
          .from('users')
          .upsert(updateData)
          .eq('id', user.id);
        error = userError;
      }

      if (error) {
        throw error;
      }

      // Update the local user context
      onUpdateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        businessName: profileData.businessName,
        avatar: avatarUrl
      });

      // Update local state
      const updatedProfileData = { ...profileData, avatar: avatarUrl };
      setProfileData(updatedProfileData);
      setOriginalData(updatedProfileData);
      
      // Clear pending avatar data
      setPendingAvatarFile(null);
      setPendingAvatarPreview(null);
      
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setPendingAvatarFile(null);
    setPendingAvatarPreview(null);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    try {
      // Store the file for later upload
      setPendingAvatarFile(file);
      
      // Create a preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setPendingAvatarPreview(previewUrl);
      
    } catch (error) {
      console.error('Error handling file upload:', error);
      alert('Failed to process the image file');
    } finally {
      // Reset the input value
      event.target.value = '';
    }
  };

  // Get the current avatar URL to display
  const getCurrentAvatarUrl = () => {
    if (pendingAvatarPreview) {
      return pendingAvatarPreview;
    }
    if (profileData.avatar) {
      return profileData.avatar;
    }
    return `https://ui-avatars.com/api/?name=${profileData.firstName}+${profileData.lastName}&background=3b82f6&color=fff&size=80`;
  };

  if (loading && !profileData.firstName) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleBackToDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your personal and business information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={getCurrentAvatarUrl()}
                    alt="Profile"
                    className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                  />
                  {isEditing && (
                    <>
                      <button 
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera className="h-4 w-4 text-gray-600" />
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </>
                  )}
                </div>
                <div className="text-white">
                  <h2 className="text-2xl font-bold">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-blue-100">{profileData.businessName}</p>
                  <p className="text-blue-200 text-sm">{profileData.email}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-white/20 text-white hover:bg-white/30 px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-white text-blue-600 hover:bg-gray-50 disabled:bg-gray-200 px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.firstName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.lastName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.email || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.phone || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-blue-600" />
                  Business Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.businessName || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.licenseNumber}
                        onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notary license number"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profileData.licenseNumber || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Commission Expiration</label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={profileData.commissionExpiration}
                        onChange={(e) => handleInputChange('commissionExpiration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 py-2">
                        {profileData.commissionExpiration 
                          ? new Date(profileData.commissionExpiration).toLocaleDateString()
                          : 'Not provided'
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Address Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="123 Main Street"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.address || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Los Angeles"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.city || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <select
                      value={profileData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="TX">Texas</option>
                      <option value="FL">Florida</option>
                      {/* Add more states as needed */}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.state || 'Not provided'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="90210"
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{profileData.zipCode || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <p className="text-gray-900 py-2">{user.provider === 'google' ? 'Google Account' : 'Email Account'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                  <p className="text-gray-900 py-2">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}