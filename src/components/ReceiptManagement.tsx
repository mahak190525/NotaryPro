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

interface OCRResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  confidence: number;
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
  const [showAddManual, setShowAddManual] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processed' | 'approved' | 'rejected'>('all');
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [processingOCR, setProcessingOCR] = useState(false);

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
  const processOCR = (file: File) => {
    setProcessingOCR(true);
    
    // Simulate OCR processing delay
    setTimeout(() => {
      const mockOCRResult: OCRResult = {
        vendor: 'Auto-detected Vendor',
        amount: Math.round((Math.random() * 100 + 10) * 100) / 100,
        date: new Date().toISOString().split('T')[0],
        description: 'Auto-detected description',
        confidence: Math.round((Math.random() * 30 + 70) * 100) / 100
      };
      setOcrResult(mockOCRResult);
      setProcessingOCR(false);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processOCR(file);
    }
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
      notes: receiptData.notes || ''
    };
    setReceipts(prev => [newReceipt, ...prev]);
    setShowAddManual(false);
    setOcrResult(null);
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
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
            >
              <Upload className="h-8 w-8 mb-2" />
              Upload Photo
              <span className="text-sm opacity-90">From device</span>
            </button>
            <button
              onClick={() => setShowCamera(true)}
              className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
            >
              <Camera className="h-8 w-8 mb-2" />
              Take Photo
              <span className="text-sm opacity-90">Use camera</span>
            </button>
            <button
              onClick={() => setShowAddManual(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg font-medium flex flex-col items-center transition-colors"
            >
              <Plus className="h-8 w-8 mb-2" />
              Manual Entry
              <span className="text-sm opacity-90">Type details</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
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
        {(processingOCR || ocrResult) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Processing Receipt</h3>
              
              {processingOCR ? (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Extracting information from receipt...</p>
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
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        addReceipt({
                          vendor: ocrResult.vendor,
                          amount: ocrResult.amount,
                          date: ocrResult.date,
                          description: ocrResult.description,
                          ocrProcessed: true,
                          status: 'processed'
                        });
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Accept & Save
                    </button>
                    <button
                      onClick={() => setOcrResult(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Take Photo</h3>
                <button
                  onClick={() => setShowCamera(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="text-center">
                <div className="bg-gray-100 p-8 rounded-lg mb-4">
                  <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Position receipt in camera view</p>
                  <button
                    onClick={() => {
                      // Simulate taking photo and processing
                      setShowCamera(false);
                      processOCR(new File([], 'camera-photo.jpg'));
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Capture Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Receipt Modal */}
        {(showAddManual || editingReceipt) && (
          <ReceiptModal
            receipt={editingReceipt}
            onSave={editingReceipt ? updateReceipt : addReceipt}
            onCancel={() => {
              setShowAddManual(false);
              setEditingReceipt(null);
            }}
            title={editingReceipt ? 'Edit Receipt' : 'Add Receipt'}
            categories={categories}
            ocrResult={ocrResult}
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

interface ReceiptModalProps {
  receipt?: ReceiptData;
  onSave: (receipt: any) => void;
  onCancel: () => void;
  title: string;
  categories: string[];
  ocrResult?: OCRResult | null;
}

function ReceiptModal({ receipt, onSave, onCancel, title, categories, ocrResult }: ReceiptModalProps) {
  const [formData, setFormData] = useState({
    vendor: receipt?.vendor || ocrResult?.vendor || '',
    amount: receipt?.amount || ocrResult?.amount || 0,
    date: receipt?.date || ocrResult?.date || new Date().toISOString().split('T')[0],
    category: receipt?.category || '',
    description: receipt?.description || ocrResult?.description || '',
    paymentMethod: receipt?.paymentMethod || 'Credit Card',
    taxDeductible: receipt?.taxDeductible ?? true,
    status: receipt?.status || 'pending',
    notes: receipt?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (receipt) {
      onSave({ ...receipt, ...formData });
    } else {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
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
              placeholder="Additional notes about this expense..."
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
      </div>
    </div>
  );
}

interface ReceiptDetailsModalProps {
  receipt: ReceiptData;
  onClose: () => void;
}

function ReceiptDetailsModal({ receipt, onClose }: ReceiptDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Receipt Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {receipt.imageUrl && (
          <div className="mb-6">
            <img
              src={receipt.imageUrl}
              alt="Receipt"
              className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
            />
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
              <p className="text-2xl font-bold text-green-600">${receipt.amount.toFixed(2)}</p>
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
  );
}