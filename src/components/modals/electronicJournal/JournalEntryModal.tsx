import React, { useState, useEffect } from 'react';
import IDScannerModal from './IDScannerModal';
import { Camera } from 'lucide-react';

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

interface JournalEntryModalProps {
  entry?: JournalEntry;
  onSave: (entry: Partial<JournalEntry> | JournalEntry) => void;
  onCancel: () => void;
  title: string;
  scannedID?: IDScanResult | null;
}

export default function JournalEntryModal({
  entry,
  onSave,
  onCancel,
  title,
  scannedID
}: JournalEntryModalProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientId: '',
    documentType: '',
    notaryFee: 0,
    location: '',
    witnessRequired: false,
    witnessName: '',
    idType: '',
    idNumber: '',
    idExpiration: '',
    notes: '',
    status: 'pending' as 'pending' | 'completed' | 'cancelled'
  });
  const [showIDScanner, setShowIDScanner] = useState(false);
const [localScannedID, setLocalScannedID] = useState<IDScanResult | null>(null);


  // useEffect(() => {
  //   setFormData({
  //     clientName: entry?.clientName || scannedID?.name || '',
  //     clientId: entry?.clientId || '',
  //     documentType: entry?.documentType || '',
  //     notaryFee: entry?.notaryFee || 0,
  //     location: entry?.location || '',
  //     witnessRequired: entry?.witnessRequired || false,
  //     witnessName: entry?.witnessName || '',
  //     idType: entry?.idType || scannedID?.type || '',
  //     idNumber: entry?.idNumber || scannedID?.number || '',
  //     idExpiration: entry?.idExpiration || scannedID?.expiration || '',
  //     notes: entry?.notes || '',
  //     status: entry?.status || 'pending',
  //   });
  // }, [entry, scannedID]);
  useEffect(() => {
  const scan = localScannedID || scannedID;
  setFormData({
    clientName: entry?.clientName || scan?.name || '',
    clientId: entry?.clientId || '',
    documentType: entry?.documentType || '',
    notaryFee: entry?.notaryFee || 0,
    location: entry?.location || '',
    witnessRequired: entry?.witnessRequired || false,
    witnessName: entry?.witnessName || '',
    idType: entry?.idType || scan?.type || '',
    idNumber: entry?.idNumber || scan?.number || '',
    idExpiration: entry?.idExpiration || scan?.expiration || '',
    notes: entry?.notes || '',
    status: entry?.status || 'pending',
  });
}, [entry, scannedID, localScannedID]);


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
          {/* Client Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <input
                type="text"
                value={formData.documentType}
                onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* Fee and Location */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notary Fee</label>
              <input
                type="number"
                value={formData.notaryFee}
                onChange={(e) => setFormData(prev => ({ ...prev, notaryFee: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </div>

          {/* ID Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
              <select
                value={formData.idType}
                onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
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
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Expiration</label>
              <input
                type="date"
                value={formData.idExpiration}
                onChange={(e) => setFormData(prev => ({ ...prev, idExpiration: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => setShowIDScanner(true)}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan ID
            </button>
            {showIDScanner && (
              <IDScannerModal
                onClose={() => setShowIDScanner(false)}
                onScan={(result) => {
                  setLocalScannedID(result);
                  setShowIDScanner(false);
                }}
              />
            )}
          </div>

          {/* Witness */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.witnessRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, witnessRequired: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">Witness Required</span>
            </label>
            {formData.witnessRequired && (
              <input
                type="text"
                placeholder="Witness Name"
                value={formData.witnessName}
                onChange={(e) => setFormData(prev => ({ ...prev, witnessName: e.target.value }))}
                className="flex-1 px-3 py-2 border rounded-lg"
              />
            )}
          </div>

          {/* Status & Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-lg"
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
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              Save Entry
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
