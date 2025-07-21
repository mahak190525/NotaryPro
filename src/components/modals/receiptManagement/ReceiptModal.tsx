import React, { useState, useEffect } from 'react';
import { X, Upload, Eye } from 'lucide-react';

interface ReceiptModalProps {
  receipt?: any;
  onSave: (receipt: any) => void;
  onCancel: () => void;
  title: string;
  categories: string[];
  ocrResult?: any;
  imageUrl?: string;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ReceiptModal({
  receipt,
  onSave,
  onCancel,
  title,
  categories,
  ocrResult,
  imageUrl,
  onFileUpload,
}: ReceiptModalProps) {
  const [formData, setFormData] = useState({
    vendor: receipt?.vendor || ocrResult?.vendor || '',
    amount: receipt?.amount || ocrResult?.amount || 0,
    date: receipt?.date || ocrResult?.date || new Date().toISOString().split('T')[0],
    category: receipt?.category || ocrResult?.category || '',
    description: receipt?.description || ocrResult?.description || '',
    paymentMethod: receipt?.paymentMethod || ocrResult?.paymentMethod || 'Credit Card',
    taxDeductible: receipt?.taxDeductible ?? true,
    status: receipt?.status || 'pending',
    notes: receipt?.notes || '',
  });

  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>(imageUrl || receipt?.imageUrl);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const isEditMode = !!receipt; // Determine if we're in edit mode

  // Update image URL when imageUrl prop changes (only for new receipts)
  useEffect(() => {
    if (imageUrl && !isEditMode) {
      setCurrentImageUrl(imageUrl);
    }
  }, [imageUrl, isEditMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (receipt) {
      // In edit mode, preserve the original image URL
      onSave({ ...receipt, ...formData, imageUrl: receipt.imageUrl });
    } else {
      // In add mode, use the current image URL
      onSave({ ...formData, imageUrl: currentImageUrl });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow file changes in add mode (not edit mode)
    if (isEditMode) return;
    
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL for the new file
      const newImageUrl = URL.createObjectURL(file);
      setCurrentImageUrl(newImageUrl);
      
      // Call the original onFileUpload if provided
      if (onFileUpload) {
        onFileUpload(e);
      }
    }
  };

  const handleRemoveImage = () => {
    // Only allow image removal in add mode (not edit mode)
    if (isEditMode) return;
    
    setCurrentImageUrl(undefined);
    setSelectedFile(null);
    
    // Reset all file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (currentImageUrl && currentImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(currentImageUrl);
      }
    };
  }, [currentImageUrl]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload/Preview Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Image</label>
            
            {currentImageUrl ? (
              <div className="space-y-3">
                {/* Image Preview */}
                <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-2">
                  <img
                    src={currentImageUrl}
                    alt="Receipt Preview"
                    className="w-full max-h-64 object-contain rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setShowImagePreview(true)}
                  />
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowImagePreview(true)}
                      className="bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-opacity"
                      title="View full size"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Image Actions - Only show in add mode */}
                {!isEditMode && (
                  <div className="flex justify-center space-x-3">
                    <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer font-medium transition-colors flex items-center">
                      <Upload className="h-4 w-4 mr-2" />
                      Replace Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 text-center">
                  {isEditMode 
                    ? "Click image to view full size • Image cannot be changed in edit mode"
                    : "Click image to view full size • Use Replace to change image • Remove to delete"
                  }
                </p>
              </div>
            ) : (
              /* Initial Upload Section - Only show in add mode */
              !isEditMode && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 font-medium">Upload receipt image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer inline-block font-medium transition-colors"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-500 mt-3">
                    Supports JPG, PNG, GIF up to 10MB. You can preview and change the image after uploading.
                  </p>
                </div>
              )
            )}
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="taxDeductible"
              checked={formData.taxDeductible}
              onChange={(e) => setFormData(prev => ({ ...prev, taxDeductible: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="taxDeductible" className="ml-2 block text-sm text-gray-900">
              Tax Deductible
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Save Receipt
            </button>
            <button 
              type="button" 
              onClick={onCancel} 
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Full Size Image Preview Modal */}
        {showImagePreview && currentImageUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-5xl max-h-full">
              <button
                onClick={() => setShowImagePreview(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={currentImageUrl}
                alt="Receipt Full Size"
                className="max-w-full max-h-full rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white px-4 py-2 rounded-lg text-sm">
                Click anywhere outside to close
              </div>
            </div>
            <div 
              className="absolute inset-0 -z-10" 
              onClick={() => setShowImagePreview(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}