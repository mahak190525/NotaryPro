import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, X, AlertCircle, RotateCcw, Scan, Upload, Eye } from 'lucide-react';
import { geminiIdService, GeminiIDResult } from '../../../utils/geminiIdService';
import CameraModal from '../../shared/CameraModal';

interface IDScannerModalProps {
  onClose: () => void;
  onScan: (result: GeminiIDResult) => void;
  scannedID: GeminiIDResult | null;
  onUse: () => void;
  onRetry: () => void;
}

export default function IDScannerModal({
  onClose,
  onScan,
  scannedID,
  onUse,
  onRetry,
}: IDScannerModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'capture' | 'processing' | 'results'>('capture');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
    setStep('capture');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset the input value so the same file can be selected again if needed
    event.target.value = '';
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const processIDImage = async () => {
    if (!capturedImage) return;

    setIsScanning(true);
    setError(null);
    setStep('processing');

    try {
      // Convert image data to file if needed
      let imageToProcess: string | File = capturedImage;
      
      if (capturedImage.startsWith('data:')) {
        // Convert data URL to File object
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        imageToProcess = new File([blob], 'id-image.jpg', { type: 'image/jpeg' });
      }

      // Scan the ID using Gemini
      const result = await geminiIdService.scanID(imageToProcess);
      
      onScan(result);
      setStep('results');
    } catch (err) {
      console.error('ID scanning error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Scanning failed: ${errorMessage}`);
      setStep('capture');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetry = () => {
    setCapturedImage(null);
    setError(null);
    setStep('capture');
    onRetry();
  };

  const handleClose = () => {
    onClose();
  };

  const renderCaptureStep = () => (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Capture ID Document</h4>
      
      {!capturedImage ? (
        <div className="space-y-4">
          <div class="flex items-center justify-center">
            <div class="space-y-4">
              <button
                onClick={triggerFileUpload}
                class="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors px-10"
              >
                <Upload class="h-8 w-8 mb-2" />
                Upload Image
                <span class="text-sm opacity-90">From gallery</span>
              </button>
            </div>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <p className="text-sm text-gray-500 text-center">
            Choose how you'd like to capture the ID document
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">ID Image Preview:</span>
              <button
                onClick={() => setCapturedImage(null)}
                className="text-gray-400 hover:text-gray-600"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <img
              src={capturedImage}
              alt="ID Preview"
              className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => setCapturedImage(null)}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Choose Different
            </button>
            <button
              onClick={processIDImage}
              disabled={isScanning}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan with Gemini
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h4 className="text-lg font-medium text-gray-900 mb-2">Processing ID Document</h4>
      <p className="text-gray-600">Analyzing document with Google Gemini AI...</p>
      <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
    </div>
  );

  const renderResultsStep = () => (
    <div>
      <h4 className="text-lg font-medium text-gray-900 mb-4">Scan Results</h4>
      
      {scannedID && (
        <div>
          <div className={`p-4 rounded-lg mb-4 ${
            scannedID.verified 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center mb-3">
              {scannedID.verified ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              )}
              <span className={`font-medium ${
                scannedID.verified ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {scannedID.verified ? 'ID Verified Successfully' : 'ID Scanned - Please Verify'}
              </span>
              <span className="ml-auto text-sm text-gray-600">
                {scannedID.confidence}% confidence
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Type:</strong> {scannedID.type}</p>
                <p><strong>Name:</strong> {scannedID.name}</p>
                <p><strong>Number:</strong> {scannedID.number}</p>
              </div>
              <div>
                <p><strong>Date of Birth:</strong> {scannedID.dateOfBirth}</p>
                <p><strong>Expiration:</strong> {scannedID.expiration}</p>
                <p><strong>Address:</strong> {scannedID.address}</p>
              </div>
            </div>

            {scannedID.confidence < 70 && (
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-yellow-800 text-xs">
                  Low confidence detected. Please verify the extracted information manually.
                </p>
              </div>
            )}
          </div>

          {/* Show captured image alongside results */}
          {capturedImage && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Scanned Image:</p>
              <img
                src={capturedImage}
                alt="Scanned ID"
                className="w-full max-h-32 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button 
              onClick={onUse} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Use This Information
            </button>
            <button 
              onClick={handleRetry} 
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Scan Again
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">ID Scanner (Gemini AI)</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center mb-6">
          <div className={`flex items-center ${step === 'capture' ? 'text-blue-600' : step === 'processing' || step === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'capture' ? 'bg-blue-100 text-blue-600' : 
              step === 'processing' || step === 'results' ? 'bg-green-100 text-green-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Capture</span>
          </div>
          
          <div className={`flex-1 h-0.5 mx-4 ${step === 'processing' || step === 'results' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${step === 'processing' ? 'text-blue-600' : step === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'processing' ? 'bg-blue-100 text-blue-600' : 
              step === 'results' ? 'bg-green-100 text-green-600' : 
              'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Process</span>
          </div>
          
          <div className={`flex-1 h-0.5 mx-4 ${step === 'results' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          
          <div className={`flex items-center ${step === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'results' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Results</span>
          </div>
        </div>

        {/* Step content */}
        {step === 'capture' && renderCaptureStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'results' && renderResultsStep()}

        {/* Help text */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            Powered by Google Gemini AI • Supports Driver's License, Passport, State ID, and Military ID
          </p>
        </div>

        {/* Camera Modal */}
        {showCamera && (
          <CameraModal
            title="Capture ID Document"
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
          />
        )}
      </div>
    </div>
  );
}