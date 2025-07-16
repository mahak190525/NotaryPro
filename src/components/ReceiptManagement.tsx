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
import ReceiptModal from './modals/receiptManagement/ReceiptModal';
import ReceiptDetailsModal from './modals/receiptManagement/ReceiptDetailsModal';
import FileUploadModal from './shared/FileUploadModal';
import CameraModal from './shared/CameraModal';
import { geminiReceiptService, GeminiReceiptResult } from '../utils/geminiReceiptService';
import GeminiOCRModal from './modals/receiptManagement/GeminiOCRModal';

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

export default function ReceiptManagement() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([
    {
      id: '1',
      date: '2025-01-15',
      vendor: 'Office Depot',
      amount: 24.99,
      category: 'Office Supplies',
      description: 'Printer paper and pens',
      paymentMethod: 'Credit Card',
      taxDeductible: true,
      imageUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
      ocrProcessed: true,
      status: 'processed',
      tags: ['office', 'supplies'],
      notes: 'Business supplies for client meetings'
    },
    {
      id: '2',
      date: '2025-01-14',
      vendor: 'Shell Gas Station',
      amount: 45.20,
      category: 'Fuel',
      description: 'Gasoline for business travel',
      paymentMethod: 'Credit Card',
      taxDeductible: true,
      imageUrl: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400',
      ocrProcessed: true,
      status: 'processed',
      tags: ['fuel', 'travel'],
      notes: 'Travel to client appointment'
    },
    {
      id: '3',
      date: '2025-01-13',
      vendor: 'Starbucks',
      amount: 12.50,
      category: 'Meals & Entertainment',
      description: 'Coffee meeting with client',
      paymentMethod: 'Cash',
      taxDeductible: true,
      ocrProcessed: false,
      status: 'pending',
      tags: ['meals', 'client'],
      notes: 'Business meeting over coffee'
    }
  ]);

  const [showUpload, setShowUpload] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showAddManual, setShowAddManual] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processed' | 'approved' | 'rejected'>('all');
  const [ocrResult, setOcrResult] = useState<GeminiReceiptResult | null>(null);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [ocrResultImageUrl, setOCRResultImageUrl] = useState<string | undefined>();
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    totalAmount: receipts.reduce((sum, receipt) => sum + receipt.amount, 0),
    taxDeductible: receipts.filter(r => r.taxDeductible).reduce((sum, receipt) => sum + receipt.amount, 0),
    pendingReceipts: receipts.filter(r => r.status === 'pending').length
  };

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
      processGeminiOCR(file);
    }
  };

  const handleFileSelect = (file: File, imageData?: string) => {
    if (imageData) {
      setOCRResultImageUrl(imageData);
    } else {
      const url = URL.createObjectURL(file);
      setOCRResultImageUrl(url);
    }
    
    // Only process OCR if not manual entry
    if (!isManualEntry) {
      processGeminiOCR(file);
    } else {
      // For manual entry, go straight to the form
      setShowAddManual(true);
    }
    setShowFileUpload(false);
  };

  const handleCameraCapture = (imageData: string) => {
    setOCRResultImageUrl(imageData);
    
    // Only process OCR if not manual entry
    if (!isManualEntry) {
      // Convert data URL to File object for OCR processing
      fetch(imageData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          processGeminiOCR(file).catch(console.error);
        });
    } else {
      // For manual entry, go straight to the form
      setShowAddManual(true);
    }
    setShowCamera(false);
  };

  const addReceipt = (receiptData: Partial<ReceiptData>) => {
    const newReceipt: ReceiptData = {
      id: Date.now().toString(),
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
    setReceipts(prev => [newReceipt, ...prev]);
    setShowAddManual(false);
    setOcrResult(null);
    setOCRResultImageUrl(undefined);
  };

  const updateReceipt = (updatedReceipt: ReceiptData) => {
    setReceipts(prev => prev.map(receipt => 
      receipt.id === updatedReceipt.id ? updatedReceipt : receipt
    ));
    setEditingReceipt(null);
  };

  const deleteReceipt = (receiptId: string) => {
    setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
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
            <button
              onClick={() => {
                setIsManualEntry(false);
                setShowFileUpload(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
            >
              <Upload className="h-8 w-8 mb-2" />
              Upload Image
              <span className="text-sm opacity-90">From device</span>
            </button>
            <button
              onClick={() => {
                setIsManualEntry(true);
                setShowAddManual(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
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
                    onClick={() => deleteReceipt(receipt.id)}
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
              addReceipt({
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

        {/* Camera Modal */}
        {showCamera && (
          <CameraModal
            onClose={() => setShowCamera(false)}
            onCapture={handleCameraCapture}
          />
        )}

        {/* File Upload Modal */}
        {/* {showFileUpload && (
          <FileUploadModal
            onClose={() => {
              setShowFileUpload(false);
              setIsManualEntry(false);
            }}
            onFileSelect={handleFileSelect}
            title="Add Receipt Image"
          />
        )} */}
        {showFileUpload && (
          <FileUploadModal
            onClose={() => setShowFileUpload(false)}
            onFileSelect={(file, previewUrl) => {
              // Optional: preview the image or start OCR
              console.log('Selected file:', file);
              console.log('Preview URL:', previewUrl);
              // You could trigger OCR here if needed:
              // runOCR(file);
            }}
            title="Upload Receipt"
          />
        )}


        {/* Add/Edit Receipt Modal */}
        {(showAddManual || editingReceipt) && (
          <ReceiptModal
            receipt={editingReceipt}
            onSave={editingReceipt ? updateReceipt : addReceipt}
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
// import React, { useState, useRef } from 'react';
// import { 
//   Upload, 
//   Camera, 
//   Receipt, 
//   Search, 
//   Filter, 
//   Download,
//   Plus,
//   Edit3,
//   Trash2,
//   Eye,
//   Calendar,
//   DollarSign,
//   Tag,
//   FileText,
//   CheckCircle,
//   AlertCircle,
//   X,
//   Scan,
//   Save
// } from 'lucide-react';
// import ReceiptModal from './modals/receiptManagement/ReceiptModal';
// import ReceiptDetailsModal from './modals/receiptManagement/ReceiptDetailsModal';
// import CameraModal from './modals/receiptManagement/CameraModal';
// import OCRProcessingModal from './modals/receiptManagement/OCRProcessingModal';
// import FileUploadModal from './modals/receiptManagement/FileUploadModal';
// import { ocrService, OCRResult } from '../utils/ocrService';

// interface ReceiptData {
//   id: string;
//   date: string;
//   vendor: string;
//   amount: number;
//   category: string;
//   description: string;
//   paymentMethod: string;
//   taxDeductible: boolean;
//   imageUrl?: string;
//   ocrProcessed: boolean;
//   status: 'pending' | 'processed' | 'approved' | 'rejected';
//   tags: string[];
//   notes: string;
// }

// interface OCRResult {
//   vendor: string;
//   amount: number;
//   date: string;
//   description: string;
//   confidence: number;
// }

// export default function ReceiptManagement() {
//   const [receipts, setReceipts] = useState<ReceiptData[]>([
//     {
//       id: '1',
//       date: '2025-01-15',
//       vendor: 'Office Depot',
//       amount: 24.99,
//       category: 'Office Supplies',
//       description: 'Printer paper and pens',
//       paymentMethod: 'Credit Card',
//       taxDeductible: true,
//       imageUrl: 'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
//       ocrProcessed: true,
//       status: 'processed',
//       tags: ['office', 'supplies'],
//       notes: 'Business supplies for client meetings'
//     },
//     {
//       id: '2',
//       date: '2025-01-14',
//       vendor: 'Shell Gas Station',
//       amount: 45.20,
//       category: 'Fuel',
//       description: 'Gasoline for business travel',
//       paymentMethod: 'Credit Card',
//       taxDeductible: true,
//       imageUrl: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=400',
//       ocrProcessed: true,
//       status: 'processed',
//       tags: ['fuel', 'travel'],
//       notes: 'Travel to client appointment'
//     },
//     {
//       id: '3',
//       date: '2025-01-13',
//       vendor: 'Starbucks',
//       amount: 12.50,
//       category: 'Meals & Entertainment',
//       description: 'Coffee meeting with client',
//       paymentMethod: 'Cash',
//       taxDeductible: true,
//       ocrProcessed: false,
//       status: 'pending',
//       tags: ['meals', 'client'],
//       notes: 'Business meeting over coffee'
//     }
//   ]);

//   const [showUpload, setShowUpload] = useState(false);
//   const [showCamera, setShowCamera] = useState(false);
//   const [showFileUpload, setShowFileUpload] = useState(false);
//   const [showAddManual, setShowAddManual] = useState(false);
//   const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
//   const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterCategory, setFilterCategory] = useState<string>('all');
//   const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processed' | 'approved' | 'rejected'>('all');
//   const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
//   const [processingOCR, setProcessingOCR] = useState(false);
//   const [ocrResultImageUrl, setOCRResultImageUrl] = useState<string | undefined>();
//   const [ocrError, setOcrError] = useState<string | null>(null);
//   const [isManualEntry, setIsManualEntry] = useState(false);

//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const categories = [
//     'Office Supplies',
//     'Fuel',
//     'Meals & Entertainment',
//     'Travel',
//     'Equipment',
//     'Software',
//     'Marketing',
//     'Professional Services',
//     'Insurance',
//     'Other'
//   ];

//   const filteredReceipts = receipts.filter(receipt => {
//     const matchesSearch = receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          receipt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          receipt.category.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = filterCategory === 'all' || receipt.category === filterCategory;
//     const matchesStatus = filterStatus === 'all' || receipt.status === filterStatus;
//     return matchesSearch && matchesCategory && matchesStatus;
//   });

//   const stats = {
//     totalReceipts: receipts.length,
//     totalAmount: receipts.reduce((sum, receipt) => sum + receipt.amount, 0),
//     taxDeductible: receipts.filter(r => r.taxDeductible).reduce((sum, receipt) => sum + receipt.amount, 0),
//     pendingReceipts: receipts.filter(r => r.status === 'pending').length
//   };

//   // Simulate OCR processing
//   const processOCR = async (file: File) => {
//     // Skip OCR if user chose manual entry
//     if (isManualEntry) {
//       return;
//     }
    
//     setProcessingOCR(true);
//     setOcrError(null);
    
//     try {
//       // Initialize OCR service if needed
//       await ocrService.initialize();
      
//       // Process the image
//       const result = await ocrService.processImage(file);
//       setOcrResult(result);
//       setProcessingOCR(false);
//     } catch (error) {
//       console.error('OCR processing failed:', error);
//       setOcrError(error instanceof Error ? error.message : 'OCR processing failed');
//       setProcessingOCR(false);
      
//       // Fallback to manual entry after a delay
//       setTimeout(() => {
//         setOcrError(null);
//         setShowAddManual(true);
//       }, 3000);
//     }
//   };

//   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const url = URL.createObjectURL(file);
//       setOCRResultImageUrl(url);
//       processOCR(file);
//     }
//   };

//   const handleFileSelect = (file: File, imageData?: string) => {
//     if (imageData) {
//       setOCRResultImageUrl(imageData);
//     } else {
//       const url = URL.createObjectURL(file);
//       setOCRResultImageUrl(url);
//     }
    
//     // Only process OCR if not manual entry
//     if (!isManualEntry) {
//       processOCR(file);
//     } else {
//       // For manual entry, go straight to the form
//       setShowAddManual(true);
//     }
//     setShowFileUpload(false);
//   };

//   const handleCameraCapture = (imageData: string) => {
//     setOCRResultImageUrl(imageData);
    
//     // Only process OCR if not manual entry
//     if (!isManualEntry) {
//       // Convert data URL to File object for OCR processing
//       fetch(imageData)
//         .then(res => res.blob())
//         .then(blob => {
//           const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
//           processOCR(file).catch(console.error);
//         });
//     } else {
//       // For manual entry, go straight to the form
//       setShowAddManual(true);
//     }
//     setShowCamera(false);
//   };

//   const addReceipt = (receiptData: Partial<ReceiptData>) => {
//     const newReceipt: ReceiptData = {
//       id: Date.now().toString(),
//       date: receiptData.date || new Date().toISOString().split('T')[0],
//       vendor: receiptData.vendor || '',
//       amount: receiptData.amount || 0,
//       category: receiptData.category || '',
//       description: receiptData.description || '',
//       paymentMethod: receiptData.paymentMethod || 'Credit Card',
//       taxDeductible: receiptData.taxDeductible ?? true,
//       ocrProcessed: receiptData.ocrProcessed ?? false,
//       status: receiptData.status || 'pending',
//       tags: receiptData.tags || [],
//       notes: receiptData.notes || '',
//       imageUrl: receiptData.imageUrl || ocrResultImageUrl
//     };
//     setReceipts(prev => [newReceipt, ...prev]);
//     setShowAddManual(false);
//     setOcrResult(null);
//     setOCRResultImageUrl(undefined);
//   };

//   const updateReceipt = (updatedReceipt: ReceiptData) => {
//     setReceipts(prev => prev.map(receipt => 
//       receipt.id === updatedReceipt.id ? updatedReceipt : receipt
//     ));
//     setEditingReceipt(null);
//   };

//   const deleteReceipt = (receiptId: string) => {
//     setReceipts(prev => prev.filter(receipt => receipt.id !== receiptId));
//   };

//   const handleCancelManualEntry = () => {
//     setShowAddManual(false);
//     setEditingReceipt(null);
//     setOcrResult(null);
//     setOCRResultImageUrl(undefined);
//     setIsManualEntry(false);
//   };
//   const exportReceipts = () => {
//     const csvData = [
//       ['Date', 'Vendor', 'Amount', 'Category', 'Description', 'Payment Method', 'Tax Deductible', 'Status'],
//       ...receipts.map(receipt => [
//         receipt.date,
//         receipt.vendor,
//         receipt.amount.toFixed(2),
//         receipt.category,
//         receipt.description,
//         receipt.paymentMethod,
//         receipt.taxDeductible ? 'Yes' : 'No',
//         receipt.status
//       ])
//     ];

//     const csvContent = csvData.map(row => row.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `receipts-${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Management</h1>
//           <p className="text-gray-600">Capture, organize, and track your business expenses</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Receipts</p>
//                 <p className="text-2xl font-bold text-blue-600">{stats.totalReceipts}</p>
//               </div>
//               <Receipt className="h-8 w-8 text-blue-600" />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Total Amount</p>
//                 <p className="text-2xl font-bold text-green-600">${stats.totalAmount.toFixed(2)}</p>
//               </div>
//               <DollarSign className="h-8 w-8 text-green-600" />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Tax Deductible</p>
//                 <p className="text-2xl font-bold text-purple-600">${stats.taxDeductible.toFixed(2)}</p>
//               </div>
//               <Tag className="h-8 w-8 text-purple-600" />
//             </div>
//           </div>
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm text-gray-600">Pending</p>
//                 <p className="text-2xl font-bold text-orange-600">{stats.pendingReceipts}</p>
//               </div>
//               <AlertCircle className="h-8 w-8 text-orange-600" />
//             </div>
//           </div>
//         </div>

//         {/* Upload Options */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Receipt</h2>
//           <div className="grid md:grid-cols-2 gap-4">
//             <button
//               onClick={() => {
//                 setIsManualEntry(false);
//                 setShowFileUpload(true);
//               }}
//               className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
//             >
//               <Upload className="h-8 w-8 mb-2" />
//               Upload Image
//               <span className="text-sm opacity-90">From device</span>
//             </button>
//             <button
//               onClick={() => {
//                 setIsManualEntry(true);
//                 setShowAddManual(true);
//               }}
//               className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
//             >
//               <Plus className="h-8 w-8 mb-2" />
//               Manual Entry
//               <span className="text-sm opacity-90">Type details</span>
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//             <div className="flex flex-col sm:flex-row gap-4 flex-1">
//               <div className="relative">
//                 <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search receipts..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//               <select
//                 value={filterCategory}
//                 onChange={(e) => setFilterCategory(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Categories</option>
//                 {categories.map(category => (
//                   <option key={category} value={category}>{category}</option>
//                 ))}
//               </select>
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value as any)}
//                 className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="processed">Processed</option>
//                 <option value="approved">Approved</option>
//                 <option value="rejected">Rejected</option>
//               </select>
//             </div>
//             <button
//               onClick={exportReceipts}
//               className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Export
//             </button>
//           </div>
//         </div>

//         {/* Receipt List */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {filteredReceipts.map((receipt) => (
//             <div key={receipt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//               {receipt.imageUrl && (
//                 <div className="h-48 bg-gray-200">
//                   <img
//                     src={receipt.imageUrl}
//                     alt="Receipt"
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               )}
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                     receipt.status === 'processed' 
//                       ? 'bg-green-100 text-green-800'
//                       : receipt.status === 'pending'
//                       ? 'bg-orange-100 text-orange-800'
//                       : receipt.status === 'approved'
//                       ? 'bg-blue-100 text-blue-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}>
//                     {receipt.status}
//                   </span>
//                   {receipt.ocrProcessed && (
//                     <Scan className="h-4 w-4 text-blue-500" title="OCR Processed" />
//                   )}
//                 </div>
                
//                 <h3 className="font-semibold text-gray-900 mb-2">{receipt.vendor}</h3>
//                 <p className="text-2xl font-bold text-green-600 mb-2">${receipt.amount.toFixed(2)}</p>
//                 <p className="text-sm text-gray-600 mb-2">{receipt.description}</p>
                
//                 <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
//                   <span>{receipt.date}</span>
//                   <span className="px-2 py-1 bg-gray-100 rounded text-xs">{receipt.category}</span>
//                 </div>
                
//                 {receipt.taxDeductible && (
//                   <div className="flex items-center text-sm text-green-600 mb-3">
//                     <CheckCircle className="h-4 w-4 mr-1" />
//                     <span>Tax Deductible</span>
//                   </div>
//                 )}
                
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => setSelectedReceipt(receipt)}
//                     className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
//                   >
//                     <Eye className="h-4 w-4 mr-1" />
//                     View
//                   </button>
//                   <button
//                     onClick={() => setEditingReceipt(receipt)}
//                     className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
//                   >
//                     <Edit3 className="h-4 w-4 mr-1" />
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => deleteReceipt(receipt.id)}
//                     className="bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* OCR Processing Modal */}
//         {(processingOCR || ocrResult) && (
//           <OCRProcessingModal
//             processing={processingOCR}
//             ocrResult={ocrResult}
//             error={ocrError}
//             onAccept={() => {
//               if (!ocrResult) return;
//               addReceipt({
//                 vendor: ocrResult.vendor,
//                 amount: ocrResult.amount,
//                 date: ocrResult.date,
//                 description: ocrResult.description,
//                 ocrProcessed: true,
//                 status: 'processed',
//                 imageUrl: ocrResultImageUrl
//               });
//             }}
//             onEdit={() => {
//               setShowAddManual(true);
//             }}
//             onRetry={() => {
//               setOcrError(null);
//               setOcrResult(null);
//               // Re-process if we have the image
//               if (ocrResultImageUrl) {
//                 fetch(ocrResultImageUrl)
//                   .then(res => res.blob())
//                   .then(blob => {
//                     const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
//                     processOCR(file).catch(console.error);
//                   });
//               }
//             }}
//           />
//         )}

//         {/* Camera Modal */}
//         {showCamera && (
//           <CameraModal
//             onClose={() => setShowCamera(false)}
//             onCapture={handleCameraCapture}
//           />
//         )}

//         {/* File Upload Modal */}
//         {showFileUpload && (
//           <FileUploadModal
//             onClose={() => {
//               setShowFileUpload(false);
//               setIsManualEntry(false);
//             }}
//             onFileSelect={handleFileSelect}
//             title="Add Receipt Image"
//           />
//         )}

//         {/* Add/Edit Receipt Modal */}
//         {(showAddManual || editingReceipt) && (
//           <ReceiptModal
//             receipt={editingReceipt}
//             onSave={editingReceipt ? updateReceipt : addReceipt}
//             onCancel={handleCancelManualEntry}
//             title={editingReceipt ? 'Edit Receipt' : 'Add Receipt'}
//             categories={categories}
//             ocrResult={ocrResult}
//             imageUrl={ocrResultImageUrl}
//             onFileUpload={handleFileUpload}
//           />
//         )}

//         {/* Receipt Details Modal */}
//         {selectedReceipt && (
//           <ReceiptDetailsModal
//             receipt={selectedReceipt}
//             onClose={() => setSelectedReceipt(null)}
//           />
//         )}
//       </div>
//     </div>
//   );
// }