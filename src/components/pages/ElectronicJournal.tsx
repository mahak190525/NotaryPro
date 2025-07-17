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
  X,
  Receipt
} from 'lucide-react';
import JournalEntryModal from '../modals/electronicJournal/JournalEntryModal';
import SignaturePadModal from '../modals/electronicJournal/SignaturePadModal';
import EntryDetailsModal from '../modals/electronicJournal/EntryDetailsModal';
import IDScannerModal from '../modals/electronicJournal/IDScannerModal';
import InvoiceModal from '../modals/electronicJournal/InvoiceModal';
import { GeminiIDResult } from '../utils/geminiIdService';

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
  const [scannedID, setScannedID] = useState<GeminiIDResult | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedEntryForInvoice, setSelectedEntryForInvoice] = useState<JournalEntry | null>(null);

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
            <div className="flex space-x-4">
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
                    onClick={() => {
                      setSelectedEntryForInvoice(entry);
                      setShowInvoiceModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Generate Invoice"
                  >
                    <Receipt className="h-4 w-4" />
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
          <SignaturePadModal 
            onClose={() => setShowSignaturePad(false)}
            onSave={(signature) => {
              console.log("Received signature:", signature);
              // Handle signature save if needed
            }}
          />
        )}

        {/* ID Scanner Modal */}
        {showIDScanner && (
          <IDScannerModal
            scannedID={scannedID}
            onClose={() => setShowIDScanner(false)}
            onScan={(result) => setScannedID(result)}
            onUse={() => {
              setShowIDScanner(false);
            }}
            onRetry={() => setScannedID(null)}
          />
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

        {/* Invoice Modal */}
        {showInvoiceModal && selectedEntryForInvoice && (
          <InvoiceModal
            entry={selectedEntryForInvoice}
            onClose={() => {
              setShowInvoiceModal(false);
              setSelectedEntryForInvoice(null);
            }}
          />
        )}
      </div>
    </div>
  );
}