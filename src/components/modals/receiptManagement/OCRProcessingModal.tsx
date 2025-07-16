import React from 'react';
import { CheckCircle } from 'lucide-react';

interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  confidence: number;
}

interface OCRProcessingModalProps {
  processing: boolean;
  ocrResult: OCRResult | null;
  error: string | null;
  onAccept: () => void;
  onEdit: () => void;
  onRetry: () => void;
}

export default function OCRProcessingModal({
  processing,
  ocrResult,
  error,
  onAccept,
  onEdit,
  onRetry,
}: OCRProcessingModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Receipt</h3>

        {processing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Reading receipt with OCR...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm">!</span>
                </div>
              </div>
              <p className="text-red-800 font-medium mb-1">OCR Processing Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={onRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={onEdit}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Manual Entry
              </button>
            </div>
          </div>
        ) : ocrResult ? (
          <div>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Information Extracted</span>
                <span className="ml-auto text-sm text-green-600">{ocrResult.confidence}% confidence</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Vendor:</strong> {ocrResult.vendor}</p>
                <p><strong>Amount:</strong> ${ocrResult.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> {ocrResult.date}</p>
                <p><strong>Description:</strong> {ocrResult.description}</p>
              </div>
              {ocrResult.confidence < 70 && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-yellow-800 text-xs">
                    Low confidence detected. Please review the extracted information.
                  </p>
                </div>
              )}
            </div>
            <div className="flex space-x-3">
              <button onClick={onAccept} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Accept & Save
              </button>
              <button onClick={onEdit} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors">
                Edit Details
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}