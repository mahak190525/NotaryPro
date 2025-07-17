import React, { useState } from 'react';
import { X, Camera, Upload, Eye } from 'lucide-react';
import CameraModal from './CameraModal';

interface FileUploadModalProps {
  onClose: () => void;
  onFileSelect: (file: File, imageData?: string) => void;
  title?: string;
}

export default function FileUploadModal({ onClose, onFileSelect, title = "Add Receipt Image" }: FileUploadModalProps) {
  const [showCamera, setShowCamera] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setPreviewImage(imageData);
    // Convert data URL to File object
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        setSelectedFile(file);
      });
    setShowCamera(false);
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelect(selectedFile, previewImage || undefined);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {!previewImage ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              
              <label className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mb-2" />
                Upload Image
                <span className="text-sm opacity-90">From gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            <p className="text-sm text-gray-500 text-center">
              Choose how you'd like to add your receipt image
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Preview:</span>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <img
                src={previewImage}
                alt="Receipt Preview"
                className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedFile(null);
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Choose Different
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Use This Image
              </button>
            </div>
          </div>
        )}

        {showCamera && (
          <CameraModal
            title="Capture Receipt"
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
          />
        )}
      </div>
    </div>
  );
}