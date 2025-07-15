import React from 'react';
import { X } from 'lucide-react';

interface EntryDetailsModalProps {
  entry: JournalEntry;
  onClose: () => void;
}

export default function EntryDetailsModal({ entry, onClose }: EntryDetailsModalProps) {
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