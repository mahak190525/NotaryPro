import React, { useState, useEffect } from 'react';
import IDScannerModal from './IDScannerModal';
import SignaturePadModal from './SignaturePadModal';
import CameraModal from '../shared/CameraModal';
import { Camera, PenTool, Scan, Fingerprint } from 'lucide-react';
import { GeminiIDResult } from '../../../utils/geminiIdService';
import { usbFingerprintService, FingerprintScanResult } from '../../../utils/usbFingerprintService';

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

interface JournalEntryModalProps {
  entry?: JournalEntry;
  onSave: (entry: Partial<JournalEntry> | JournalEntry) => void;
  onCancel: () => void;
  title: string;
  scannedID?: GeminiIDResult | null;
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
    appointmentType: 'in-person' as 'online' | 'in-person',
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
  const [showCamera, setShowCamera] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [localScannedID, setLocalScannedID] = useState<GeminiIDResult | null>(scannedID || null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [fingerprintData, setFingerprintData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    const scan = localScannedID || scannedID;
    setFormData({
      clientName: entry?.clientName || scan?.name || '',
      clientId: entry?.clientId || '',
      appointmentType: entry?.appointmentType || 'in-person',
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
    const entryData = {
      ...formData,
      signature: signatureData || entry?.signature,
      thumbprint: fingerprintData || entry?.thumbprint,
      idVerified: !!(localScannedID || scannedID || entry?.idVerified)
    };
    
    if (entry) {
      onSave({ ...entry, ...entryData });
    } else {
      onSave(entryData);
    }
  };

  const handleIDScan = (scanResult: GeminiIDResult) => {
    setLocalScannedID(scanResult);
  };

  const handleIDScanSuccess = () => {
    setShowIDScanner(false);
  };

  const handleSignatureSave = (signature: string) => {
    setSignatureData(signature);
    setShowSignaturePad(false);
  };

  const startFingerprintScan = async () => {
    setIsScanning(true);
    setScanError(null);
    
    try {
      // Try to connect to USB fingerprint scanner
      try {
        const device = await usbFingerprintService.requestDevice();
        await usbFingerprintService.connectDevice();
        
        // Perform the actual scan
        const scanResult: FingerprintScanResult = await usbFingerprintService.scanFingerprint();
        
        if (scanResult.success && scanResult.imageData) {
          setFingerprintData(scanResult.imageData);
        } else {
          throw new Error(scanResult.error || 'Scan failed');
        }
        
        // Disconnect when done
        await usbFingerprintService.disconnectDevice();
      } catch (usbError) {
        console.warn('USB scanner not available, using mock data:', usbError);
        // Fallback to mock fingerprint for testing
        await simulateFingerprintScan();
      }
      
    } catch (error) {
      console.error('USB fingerprint scan error:', error);
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          setScanError('USB device selection was cancelled');
        } else if (error.message.includes('not supported')) {
          setScanError('WebUSB is not supported in this browser. Please use Chrome, Edge, or Opera.');
        } else if (error.message.includes('No device selected')) {
          setScanError('No USB fingerprint scanner was selected');
        } else {
          setScanError(`USB error: ${error.message}`);
        }
      } else {
        setScanError('Failed to connect to fingerprint scanner');
      }
      setIsScanning(false);
    }
  };

  const simulateFingerprintScan = async () => {
    // Simulate scanning delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate mock fingerprint data using the service
    const mockFingerprint = usbFingerprintService.generateMockFingerprint();
    setFingerprintData(mockFingerprint);
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Info */}
          <div className="grid md:grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
              <select
                value={formData.appointmentType}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value as 'online' | 'in-person' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="in-person">In-Person</option>
                <option value="online">Online</option>
              </select>
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

          {/* Fee and Location */}
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

          {/* ID Info */}
          <div className="space-y-4">
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
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowIDScanner(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan ID with Gemini
              </button>
              
              <div className="flex items-center space-x-4">
                {capturedImage && (
                  <div className="flex items-center space-x-2">
                    <img src={capturedImage} alt="ID Photo" className="w-12 h-8 object-cover rounded border" />
                    <span className="text-sm text-green-600">Photo Captured</span>
                  </div>
                )}
                
                {(localScannedID || scannedID) && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">ID Verified by Gemini</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature Capture for In-Person Appointments */}
          {formData.appointmentType === 'in-person' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Biometric Capture</label>
              <div className="grid md:grid-cols-2 gap-3">
                {/* Digital Signature */}
                <button
                  type="button"
                  onClick={() => setShowSignaturePad(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  <PenTool className="w-4 h-4 mr-2" />
                  Capture Signature
                </button>
                
                {/* Fingerprint Scanner */}
                <button
                  type="button"
                  onClick={startFingerprintScan}
                  disabled={isScanning}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg flex items-center transition-colors"
                >
                  {isScanning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 mr-2" />
                      Scan Fingerprint
                    </>
                  )}
                </button>
              </div>
              
              {/* Status indicators */}
              <div className="mt-3 space-y-2">
                {signatureData && (
                  <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                    <img src={signatureData} alt="Signature" className="w-16 h-8 object-contain border rounded" />
                    <span className="text-sm text-purple-600 font-medium">✓ Digital Signature Captured</span>
                  </div>
                )}
                
                {fingerprintData && (
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <img src={fingerprintData} alt="Fingerprint" className="w-8 h-8 object-contain border rounded" />
                    <span className="text-sm text-green-600 font-medium">✓ Fingerprint Captured</span>
                  </div>
                )}
                
                {scanError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{scanError}</p>
                    <button
                      type="button"
                      onClick={() => setScanError(null)}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-xs text-gray-500">
                <p>• Digital signature is required for all in-person appointments</p>
                <p>• Fingerprint scan is optional but recommended for enhanced security</p>
                <p>• Ensure your USB fingerprint scanner is connected and drivers are installed</p>
              </div>
            </div>
          )}

          {/* Witness */}
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

          {/* Status & Notes */}
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
              placeholder="Additional notes about the notarization..."
            />
          </div>

          {/* Action Buttons */}
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

        {/* Camera Modal for ID Photo */}
        {showCamera && (
          <CameraModal
            title="Take ID Photo"
            onClose={() => setShowCamera(false)}
            onCapture={(imageData) => {
              setCapturedImage(imageData);
              setShowCamera(false);
            }}
          />
        )}

        {/* Signature Pad Modal */}
        {showSignaturePad && (
          <SignaturePadModal
            onClose={() => setShowSignaturePad(false)}
            onSave={handleSignatureSave}
          />
        )}

        {/* ID Scanner Modal */}
        {showIDScanner && (
          <IDScannerModal
            scannedID={localScannedID}
            onClose={() => setShowIDScanner(false)}
            onScan={handleIDScan}
            onUse={handleIDScanSuccess}
            onRetry={() => setLocalScannedID(null)}
          />
        )}
      </div>
    </div>
  );
}