import React from 'react';
import { Shield, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onShowAuth: () => void;
}

export default function ProtectedRoute({ children, isAuthenticated, onShowAuth }: ProtectedRouteProps) {
  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Access Required
          </h2>
          <p className="text-gray-600 mb-8">
            Please sign in to access your notary business dashboard and all the powerful features.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Secure & Professional
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Your business data is protected with bank-level security and encryption.
          </p>
          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            <li>• Complete business management platform</li>
            <li>• Automated expense tracking & tax optimization</li>
            <li>• Electronic journal with digital signatures</li>
            <li>• Professional invoicing & client management</li>
            <li>• Mobile app with offline sync</li>
          </ul>
        </div>

        <button
          onClick={onShowAuth}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
        >
          Sign In to Get Started
        </button>

        <p className="text-xs text-gray-500">
          New to NotaryPro? You can create an account during the sign-in process.
        </p>
      </div>
    </div>
  );
}