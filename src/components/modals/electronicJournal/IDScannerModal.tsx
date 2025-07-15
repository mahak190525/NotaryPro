import React from 'react';
import { Camera, CheckCircle, X } from 'lucide-react';

interface IDScannerModalProps {
  onClose: () => void;
  onScan: () => void;
  scannedID: IDScanResult | null;
  onUse: () => void;
  onRetry: () => void;
}

export interface IDScanResult {
  type: string;
  number: string;
  name: string;
  address: string;
  dateOfBirth: string;
  expiration: string;
  verified: boolean;
}

export default function IDScannerModal({
  onClose,
  onScan,
  scannedID,
  onUse,
  onRetry,
}: IDScannerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">ID Scanner</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {!scannedID ? (
          <div className="text-center">
            <div className="bg-gray-100 p-8 rounded-lg mb-4">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Position ID document in camera view</p>
              <button
                onClick={onScan}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Scan
              </button>
            </div>
            <p className="text-sm text-gray-500">Supports Driver's License, Passport, State ID</p>
          </div>
        ) : (
          <div>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">ID Verified Successfully</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Type:</strong> {scannedID.type}</p>
                <p><strong>Name:</strong> {scannedID.name}</p>
                <p><strong>Number:</strong> {scannedID.number}</p>
                <p><strong>Expiration:</strong> {scannedID.expiration}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button onClick={onUse} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium">
                Use This ID
              </button>
              <button onClick={onRetry} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium">
                Scan Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
