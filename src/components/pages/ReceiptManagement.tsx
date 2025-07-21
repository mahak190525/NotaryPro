import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  Receipt, 
  Search, 
  Filter, 
  Download,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  Tag,
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Scan,
  Save
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchReceipts, addReceipt, updateReceipt, deleteReceipt } from '../../store/slices/receiptSlice';
import ReceiptModal from '../modals/receiptManagement/ReceiptModal';
import ReceiptDetailsModal from '../modals/receiptManagement/ReceiptDetailsModal';
import FileUploadModal from '../modals/shared/FileUploadModal';
import CameraModal from '../modals/shared/CameraModal';
import { geminiReceiptService, GeminiReceiptResult } from '../../utils/geminiReceiptService';
import GeminiOCRModal from '../modals/receiptManagement/GeminiOCRModal';

export default function ReceiptManagement() {
  const dispatch = useAppDispatch();
  const { receipts, isLoading, totalAmount, taxDeductibleAmount } = useAppSelector((state) => state.receipts);
  const { user } = useAppSelector((state) => state.auth);

  const [showUpload, setShowUpload] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<any | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processed' | 'approved' | 'rejected'>('all');
  const [ocrResult, setOcrResult] = useState<GeminiReceiptResult | null>(null);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [ocrResultImageUrl, setOCRResultImageUrl] = useState<string | undefined>();
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);


  const categories = [
    'Office Supplies',
    'Fuel',
    'Meals & Entertainment',
    'Travel',
    'Equipment',
    'Software',
    'Marketing',
    'Professional Services',
    'Insurance',
    'Other'
  ];

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         receipt.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || receipt.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    totalReceipts: receipts.length,
    totalAmount,
    taxDeductible: taxDeductibleAmount,
    pendingReceipts: receipts.filter(r => r.status === 'pending').length
  };

  // Load receipts on component mount
  React.useEffect(() => {
    if (user?.id) {
      dispatch(fetchReceipts({ userId: user.id }));
    }
  }, [dispatch, user?.id]);

  // Simulate OCR processing
  const processGeminiOCR = async (file: File) => {
    // Skip OCR if user chose manual entry
    if (isManualEntry) {
      return;
    }
    
    setProcessingOCR(true);
    setOcrError(null);
    
    try {
      // Process the image with Gemini
      const result = await geminiReceiptService.processReceipt(file);
      setOcrResult(result);
      setProcessingOCR(false);
    } catch (error) {
      console.error('Gemini processing failed:', error);
      setOcrError(error instanceof Error ? error.message : 'Gemini processing failed');
      setProcessingOCR(false);
      
      // Fallback to manual entry after a delay
      setTimeout(() => {
        setOcrError(null);
        setShowAddManual(true);
      }, 3000);
    }
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setOCRResultImageUrl(url);
      
      // Only process OCR if not in manual entry mode
      if (!isManualEntry) {
        processGeminiOCR(file);
      } else {
        // For manual entry, go straight to the form
        setShowAddManual(true);
      }
    }
  };


  const handleAddReceipt = async (receiptData: any) => {
    if (!user?.id) return;

    const newReceiptData = {
      userId: user.id,
      date: receiptData.date || new Date().toISOString().split('T')[0],
      vendor: receiptData.vendor || '',
      amount: receiptData.amount || 0,
      category: receiptData.category || '',
      description: receiptData.description || '',
      paymentMethod: receiptData.paymentMethod || 'Credit Card',
      taxDeductible: receiptData.taxDeductible ?? true,
      ocrProcessed: receiptData.ocrProcessed ?? false,
      status: receiptData.status || 'pending',
      tags: receiptData.tags || [],
      notes: receiptData.notes || '',
      imageUrl: receiptData.imageUrl || ocrResultImageUrl
    };

    const result = await dispatch(addReceipt({ receipt: newReceiptData }));
    
    if (addReceipt.fulfilled.match(result)) {
      setShowAddManual(false);
      setOcrResult(null);
      setOCRResultImageUrl(undefined);
    }
  };

  const handleUpdateReceipt = async (updatedReceipt: any) => {
    const result = await dispatch(updateReceipt({ receipt: updatedReceipt }));
    
    if (updateReceipt.fulfilled.match(result)) {
      setEditingReceipt(null);
    }
  };

  const handleDeleteReceipt = async (receiptId: string) => {
    await dispatch(deleteReceipt({ receiptId }));
  };

  const addReceiptLegacy = (receiptData: any) => {
    handleAddReceipt(receiptData);
    setShowAddManual(false);
    setOcrResult(null);
    setOCRResultImageUrl(undefined);
  };

  const handleCancelManualEntry = () => {
    setShowAddManual(false);
    setEditingReceipt(null);
    setOcrResult(null);
    setOCRResultImageUrl(undefined);
    setIsManualEntry(false);
  };
  const exportReceipts = () => {
    const csvData = [
      ['Date', 'Vendor', 'Amount', 'Category', 'Description', 'Payment Method', 'Tax Deductible', 'Status'],
      ...receipts.map(receipt => [
        receipt.date,
        receipt.vendor,
        receipt.amount.toFixed(2),
        receipt.category,
        receipt.description,
        receipt.paymentMethod,
        receipt.taxDeductible ? 'Yes' : 'No',
        receipt.status
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `receipts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Management</h1>
          <p className="text-gray-600">Capture, organize, and track your business expenses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Receipts</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalReceipts}</p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-green-600">${stats.totalAmount.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tax Deductible</p>
                <p className="text-2xl font-bold text-purple-600">${stats.taxDeductible.toFixed(2)}</p>
              </div>
              <Tag className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingReceipts}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Upload Options */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Receipt</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Embedded File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Upload receipt image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block font-medium transition-colors"
                >
                  Choose File
                </label>
                <p className="text-xs text-gray-500 mt-2">From device</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsManualEntry(true);
                setShowAddManual(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg font-medium flex flex-col items-center justify-center transition-colors"
            >
              <Plus className="h-8 w-8 mb-2" />
              Manual Entry
              <span className="text-sm opacity-90">Type details</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={exportReceipts}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Receipt List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReceipts.map((receipt) => (
            <div key={receipt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {receipt.imageUrl && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={receipt.imageUrl}
                    alt="Receipt"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                  {receipt.ocrProcessed && (
                    <Scan className="h-4 w-4 text-blue-500" title="OCR Processed" />
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{receipt.vendor}</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">${receipt.amount.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-2">{receipt.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <span>{receipt.date}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{receipt.category}</span>
                </div>
                
                {receipt.taxDeductible && (
                  <div className="flex items-center text-sm text-green-600 mb-3">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Tax Deductible</span>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedReceipt(receipt)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => setEditingReceipt(receipt)}
                    className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReceipt(receipt.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* OCR Processing Modal */}
        {(processingOCR || ocrResult || ocrError) && (
          <GeminiOCRModal
            processing={processingOCR}
            ocrResult={ocrResult}
            error={ocrError}
            onAccept={() => {
              if (!ocrResult) return;
              handleAddReceipt({
                vendor: ocrResult.vendor,
                amount: ocrResult.amount,
                date: ocrResult.date,
                description: ocrResult.description,
                category: ocrResult.category || '',
                paymentMethod: ocrResult.paymentMethod || 'Credit Card',
                ocrProcessed: true,
                status: 'processed',
                imageUrl: ocrResultImageUrl
              });
            }}
            onEdit={() => {
              setShowAddManual(true);
            }}
            onRetry={() => {
              setOcrError(null);
              setOcrResult(null);
              // Re-process if we have the image
              if (ocrResultImageUrl) {
                fetch(ocrResultImageUrl)
                  .then(res => res.blob())
                  .then(blob => {
                    const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
                    processGeminiOCR(file).catch(console.error);
                  });
              }
            }}
          />
        )}


        {/* Add/Edit Receipt Modal */}
        {(showAddManual || editingReceipt) && (
          <ReceiptModal
            receipt={editingReceipt}
            onSave={editingReceipt ? handleUpdateReceipt : addReceiptLegacy}
            onCancel={handleCancelManualEntry}
            title={editingReceipt ? 'Edit Receipt' : 'Add Receipt'}
            categories={categories}
            ocrResult={ocrResult}
            imageUrl={ocrResultImageUrl}
            onFileUpload={handleFileUpload}
          />
        )}

        {/* Receipt Details Modal */}
        {selectedReceipt && (
          <ReceiptDetailsModal
            receipt={selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </div>
    </div>
  );
}