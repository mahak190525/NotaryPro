import React from 'react';
import { CheckCircle, AlertCircle, RotateCcw } from 'lucide-react';

interface GeminiReceiptResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  confidence: number;
  category?: string;
  paymentMethod?: string;
}

interface GeminiOCRModalProps {
  processing: boolean;
  ocrResult: GeminiReceiptResult | null;
  error: string | null;
  onAccept: () => void;
  onEdit: () => void;
  onRetry: () => void;
}

export default function GeminiOCRModal({
  processing,
  ocrResult,
  error,
  onAccept,
  onEdit,
  onRetry,
}: GeminiOCRModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Receipt</h3>

        {processing ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Analyzing receipt with Gemini AI...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-red-800 font-medium mb-1">Processing Failed</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={onRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
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
              <div className="flex items-center mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-green-800">Information Extracted</span>
                <span className="ml-auto text-sm text-green-600">{ocrResult.confidence}% confidence</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Vendor:</p>
                    <p className="text-gray-900">{ocrResult.vendor}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Amount:</p>
                    <p className="text-gray-900 font-semibold">${ocrResult.amount.toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-700">Date:</p>
                    <p className="text-gray-900">{ocrResult.date}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Category:</p>
                    <p className="text-gray-900">{ocrResult.category || 'Other'}</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Description:</p>
                  <p className="text-gray-900">{ocrResult.description}</p>
                </div>
                {ocrResult.paymentMethod && ocrResult.paymentMethod !== 'Unknown' && (
                  <div>
                    <p className="font-medium text-gray-700">Payment Method:</p>
                    <p className="text-gray-900">{ocrResult.paymentMethod}</p>
                  </div>
                )}
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
              <button 
                onClick={onAccept} 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Accept & Save
              </button>
              <button 
                onClick={onEdit} 
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Edit Details
              </button>
            </div>
          </div>
        ) : null}
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}