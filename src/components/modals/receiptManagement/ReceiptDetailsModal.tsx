import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ReceiptData {
  id: string;
  date: string;
  vendor: string;
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  taxDeductible: boolean;
  imageUrl?: string;
  ocrProcessed: boolean;
  status: 'pending' | 'processed' | 'approved' | 'rejected';
  tags: string[];
  notes: string;
}

interface ReceiptDetailsModalProps {
  receipt: ReceiptData;
  onClose: () => void;
}

export default function ReceiptDetailsModal({ receipt, onClose }: ReceiptDetailsModalProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-screen overflow-y-auto p-6 relative shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Receipt Details</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          {receipt.imageUrl && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
              {console.log('img',receipt.imageURL)}
              <div className="relative">
                <img
                  src={receipt.imageUrl}
                  alt="Receipt"
                  onClick={() => setIsZoomed(true)}
                  className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-zoom-in hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    console.error('Failed to load image:', receipt.imageUrl);
                    e.currentTarget.style.display = 'none';
                    const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                    if (errorDiv) errorDiv.style.display = 'block';
                  }}
                  onLoad={() => {
                    console.log('Image loaded successfully:', receipt.imageUrl);
                  }}
                />
                <div 
                  className="hidden w-full h-64 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center"
                  style={{ display: 'none' }}
                >
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm">Image not available</p>
                    <p className="text-xs mt-1">URL: {receipt.imageUrl}</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Click to enlarge</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor</label>
                <p className="text-gray-900">{receipt.vendor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <p className="text-2xl font-bold text-green-600">${receipt.amount?.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">{receipt.date}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{receipt.category}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <p className="text-gray-900">{receipt.paymentMethod}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  receipt.status === 'processed'
                    ? 'bg-green-100 text-green-800'
                    : receipt.status === 'pending'
                    ? 'bg-orange-100 text-orange-800'
                    : receipt.status === 'approved'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {receipt.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tax Deductible</label>
                <p className="text-gray-900">{receipt.taxDeductible ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">OCR Processed</label>
                <p className="text-gray-900">{receipt.ocrProcessed ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <p className="text-gray-900">{receipt.description}</p>
          </div>

          {receipt.notes && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="text-gray-900">{receipt.notes}</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Full Size Image Preview Modal */}
      {isZoomed && receipt.imageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl max-h-full">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={receipt.imageUrl}
              alt="Receipt Full Size"
              className="max-w-full max-h-full rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm">
              Click anywhere outside to close
            </div>
          </div>
          <div 
            className="absolute inset-0 -z-10" 
            onClick={() => setIsZoomed(false)}
          />
        </div>
      )}
    </>
  );
}