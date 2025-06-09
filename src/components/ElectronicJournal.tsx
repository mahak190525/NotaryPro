import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, 
  Scan, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  Clock,
  Eye,
  Edit3,
  Trash2,
  Camera,
  Save,
  X
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  time: string;
  clientName: string;
  clientId: string;
  documentType: string;
  notaryFee: number;
  location: string;
  witnessRequired: boolean;
  witnessName?: string;
  signature?: string;
  thumbprint?: string;
  idVerified: boolean;
  idType: string;
  idNumber: string;
  idExpiration: string;
  notes: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface IDScanResult {
  type: string;
  number: string;
  name: string;
  address: string;
  dateOfBirth: string;
  expiration: string;
  verified: boolean;
}

export default function ElectronicJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      date: '2025-01-15',
      time: '10:30 AM',
      clientName: 'John Smith',
      clientId: 'JS001',
      documentType: 'Power of Attorney',
      notaryFee: 15.00,
      location: '123 Main St, Downtown',
      witnessRequired: true,
      witnessName: 'Jane Doe',
      idVerified: true,
      idType: 'Driver\'s License',
      idNumber: 'DL123456789',
      idExpiration: '2027-03-15',
      notes: 'Client appeared in person, ID verified successfully',
      status: 'completed'
    },
    {
      id: '2',
      date: '2025-01-14',
      time: '2:15 PM',
      clientName: 'Sarah Johnson',
      clientId: 'SJ002',
      documentType: 'Affidavit',
      notaryFee: 10.00,
      location: '456 Oak Ave, Uptown',
      witnessRequired: false,
      idVerified: true,
      idType: 'Passport',
      idNumber: 'P987654321',
      idExpiration: '2029-08-20',
      notes: 'Remote notarization via video call',
      status: 'completed'
    }
  ]);

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showIDScanner, setShowIDScanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [scannedID, setScannedID] = useState<IDScanResult | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.idNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || entry.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalEntries: entries.length,
    completedEntries: entries.filter(e => e.status === 'completed').length,
    pendingEntries: entries.filter(e => e.status === 'pending').length,
    totalFees: entries.filter(e => e.status === 'completed').reduce((sum, e) => sum + e.notaryFee, 0)
  };

  // Signature pad functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const signatureData = canvas.toDataURL();
      // Here you would save the signature data
      console.log('Signature saved:', signatureData);
      setShowSignaturePad(false);
    }
  };

  // ID Scanner simulation
  const simulateIDScan = () => {
    // Simulate OCR processing
    setTimeout(() => {
      const mockScanResult: IDScanResult = {
        type: 'Driver\'s License',
        number: 'DL987654321',
        name: 'Michael Brown',
        address: '789 Pine St, Westside',
        dateOfBirth: '1985-06-15',
        expiration: '2028-06-15',
        verified: true
      };
      setScannedID(mockScanResult);
    }, 2000);
  };

  const addEntry = (entryData: Partial<JournalEntry>) => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: entryData.date || new Date().toISOString().split('T')[0],
      time: entryData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clientName: entryData.clientName || '',
      clientId: entryData.clientId || '',
      documentType: entryData.documentType || '',
      notaryFee: entryData.notaryFee || 0,
      location: entryData.location || '',
      witnessRequired: entryData.witnessRequired || false,
      witnessName: entryData.witnessName || '',
      idVerified: entryData.idVerified || false,
      idType: entryData.idType || '',
      idNumber: entryData.idNumber || '',
      idExpiration: entryData.idExpiration || '',
      notes: entryData.notes || '',
      status: entryData.status || 'pending'
    };
    setEntries(prev => [newEntry, ...prev]);
    setShowAddEntry(false);
  };

  const updateEntry = (updatedEntry: JournalEntry) => {
    setEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
    setEditingEntry(null);
  };

  const deleteEntry = (entryId: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const exportJournal = () => {
    const csvData = [
      ['Date', 'Time', 'Client Name', 'Document Type', 'Fee', 'Location', 'ID Type', 'ID Number', 'Status'],
      ...entries.map(entry => [
        entry.date,
        entry.time,
        entry.clientName,
        entry.documentType,
        `$${entry.notaryFee.toFixed(2)}`,
        entry.location,
        entry.idType,
        entry.idNumber,
        entry.status
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notary-journal-${new Date().toISOString().split('T')[0]}.csv`);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Electronic Journal</h1>
          <p className="text-gray-600">Maintain compliant records with digital signatures and ID verification</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalEntries}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedEntries}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pendingEntries}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fees</p>
                <p className="text-2xl font-bold text-purple-600">${stats.totalFees.toFixed(2)}</p>
              </div>
              <PenTool className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSignaturePad(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Signature Pad
              </button>
              <button
                onClick={() => setShowIDScanner(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <Scan className="h-4 w-4 mr-2" />
                Scan ID
              </button>
              <button
                onClick={() => setShowAddEntry(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </button>
              <button
                onClick={exportJournal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Journal Entries */}
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      entry.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : entry.status === 'pending'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {entry.status}
                    </span>
                    <span className="text-sm text-gray-500">{entry.date} at {entry.time}</span>
                    {entry.idVerified && (
                      <CheckCircle className="h-4 w-4 text-green-500" title="ID Verified" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{entry.clientName} - {entry.documentType}</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>ID: {entry.idType} ({entry.idNumber})</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{entry.location}</span>
                    </div>
                    <div className="flex items-center">
                      <PenTool className="h-4 w-4 mr-2" />
                      <span>Fee: ${entry.notaryFee.toFixed(2)}</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-500 mt-2">{entry.notes}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedEntry(entry)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Edit Entry"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Signature Pad Modal */}
        {showSignaturePad && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Digital Signature Pad</h3>
                <button
                  onClick={() => setShowSignaturePad(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full border border-gray-200 rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <p className="text-sm text-gray-500 mt-2 text-center">Sign above using your mouse or touch device</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={clearSignature}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={saveSignature}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Signature
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ID Scanner Modal */}
        {showIDScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">ID Scanner</h3>
                <button
                  onClick={() => setShowIDScanner(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {!scannedID ? (
                <div className="text-center">
                  <div className="bg-gray-100 p-8 rounded-lg mb-4">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Position ID document in camera view</p>
                    <button
                      onClick={simulateIDScan}
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
                    <button
                      onClick={() => {
                        setScannedID(null);
                        setShowIDScanner(false);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Use This ID
                    </button>
                    <button
                      onClick={() => setScannedID(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      Scan Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Add/Edit Entry Modal */}
        {(showAddEntry || editingEntry) && (
          <JournalEntryModal
            entry={editingEntry}
            onSave={editingEntry ? updateEntry : addEntry}
            onCancel={() => {
              setShowAddEntry(false);
              setEditingEntry(null);
            }}
            title={editingEntry ? 'Edit Journal Entry' : 'Add Journal Entry'}
            scannedID={scannedID}
          />
        )}

        {/* Entry Details Modal */}
        {selectedEntry && (
          <EntryDetailsModal
            entry={selectedEntry}
            onClose={() => setSelectedEntry(null)}
          />
        )}
      </div>
    </div>
  );
}

interface JournalEntryModalProps {
  entry?: JournalEntry;
  onSave: (entry: any) => void;
  onCancel: () => void;
  title: string;
  scannedID?: IDScanResult | null;
}

function JournalEntryModal({ entry, onSave, onCancel, title, scannedID }: JournalEntryModalProps) {
  const [formData, setFormData] = useState({
    clientName: entry?.clientName || scannedID?.name || '',
    clientId: entry?.clientId || '',
    documentType: entry?.documentType || '',
    notaryFee: entry?.notaryFee || 0,
    location: entry?.location || '',
    witnessRequired: entry?.witnessRequired || false,
    witnessName: entry?.witnessName || '',
    idType: entry?.idType || scannedID?.type || '',
    idNumber: entry?.idNumber || scannedID?.number || '',
    idExpiration: entry?.idExpiration || scannedID?.expiration || '',
    notes: entry?.notes || '',
    status: entry?.status || 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (entry) {
      onSave({ ...entry, ...formData });
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <input
                type="text"
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notary Fee</label>
              <input
                type="number"
                step="0.01"
                value={formData.notaryFee}
                onChange={(e) => setFormData(prev => ({ ...prev, notaryFee: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select ID Type</option>
                <option value="Driver's License">Driver's License</option>
                <option value="Passport">Passport</option>
                <option value="State ID">State ID</option>
                <option value="Military ID">Military ID</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiration</label>
              <input
                type="date"
                value={formData.idExpiration}
                onChange={(e) => setFormData(prev => ({ ...prev, idExpiration: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.witnessRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, witnessRequired: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">Witness Required</span>
            </label>
            {formData.witnessRequired && (
              <input
                type="text"
                placeholder="Witness Name"
                value={formData.witnessName}
                onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes about this notarization..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Save Entry
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

interface EntryDetailsModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

function EntryDetailsModal({ entry, onClose }: EntryDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Journal Entry Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date & Time</label>
              <p className="text-gray-900">{entry.date} at {entry.time}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                entry.status === 'completed' 
                  ? 'bg-green-100 text-green-800'
                  : entry.status === 'pending'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {entry.status}
              </span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <p className="text-gray-900">{entry.clientName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <p className="text-gray-900">{entry.documentType}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Notary Fee</label>
              <p className="text-gray-900">${entry.notaryFee.toFixed(2)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <p className="text-gray-900">{entry.location}</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Type</label>
              <p className="text-gray-900">{entry.idType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <p className="text-gray-900">{entry.idNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Expiration</label>
              <p className="text-gray-900">{entry.idExpiration}</p>
            </div>
          </div>
          
          {entry.witnessRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Witness</label>
              <p className="text-gray-900">{entry.witnessName}</p>
            </div>
          )}
          
          {entry.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <p className="text-gray-900">{entry.notes}</p>
            </div>
          )}
        </div>
        
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