import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { X, Save, RotateCcw, Fingerprint } from 'lucide-react';

interface SignatureCaptureModalProps {
  onClose: () => void;
  onSaveSignature: (signatureData: string) => void;
  onSaveThumbprint: (thumbprintData: string) => void;
  appointmentType: 'online' | 'in-person';
}

export default function SignatureCaptureModal({ 
  onClose, 
  onSaveSignature, 
  onSaveThumbprint,
  appointmentType 
}: SignatureCaptureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [activeTab, setActiveTab] = useState<'signature' | 'thumbprint'>('signature');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [thumbprintData, setThumbprintData] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (activeTab === 'signature') {
      initializeSignaturePad();
    }
    
    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, [activeTab]);

  const initializeSignaturePad = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = 600 * ratio;
    canvas.height = 200 * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255,255,255)',
      penColor: 'black',
      minWidth: 1,
      maxWidth: 3,
    });

    signaturePadRef.current = signaturePad;
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setSignatureData(null);
  };

  const saveSignature = () => {
    if (signaturePadRef.current?.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const dataUrl = signaturePadRef.current.toDataURL();
    setSignatureData(dataUrl);
    onSaveSignature(dataUrl);
  };

  const startThumbprintScan = () => {
    setIsScanning(true);
    
    // Simulate USB fingerprint scanner
    setTimeout(() => {
      // Mock thumbprint data - in real implementation, this would come from the scanner
      const mockThumbprint = generateMockThumbprint();
      setThumbprintData(mockThumbprint);
      setIsScanning(false);
      onSaveThumbprint(mockThumbprint);
    }, 3000);
  };

  const generateMockThumbprint = () => {
    // Generate a mock thumbprint image (in real implementation, this would come from scanner)
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 200, 200);
      
      // Draw mock fingerprint pattern
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(100, 100, 20 + i * 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Add some random lines for fingerprint ridges
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200, Math.random() * 200);
        ctx.lineTo(Math.random() * 200, Math.random() * 200);
        ctx.stroke();
      }
    }
    
    return canvas.toDataURL();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Biometric Capture</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {appointmentType === 'in-person' && (
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('signature')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                activeTab === 'signature'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Digital Signature
            </button>
            <button
              onClick={() => setActiveTab('thumbprint')}
              className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-colors ${
                activeTab === 'thumbprint'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Thumbprint
            </button>
          </div>
        )}

        {activeTab === 'signature' && (
          <div>
            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={canvasRef}
                width={600}
                height={200}
                className="w-full border border-gray-200 rounded cursor-crosshair bg-white"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Sign above using your stylus, mouse, or touch device
              </p>
            </div>

            <div className="flex space-x-3 mb-4">
              <button
                onClick={clearSignature}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                <RotateCcw className="h-4 w-4 inline mr-2" />
                Clear
              </button>
              <button
                onClick={saveSignature}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                <Save className="h-4 w-4 inline mr-2" />
                Save Signature
              </button>
            </div>

            {signatureData && (
              <div className="border-t pt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Signature Captured:</p>
                <img
                  src={signatureData}
                  alt="Signature"
                  className="mx-auto border border-gray-300 rounded max-h-24"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'thumbprint' && appointmentType === 'in-person' && (
          <div>
            <div className="text-center">
              <div className="bg-gray-100 p-8 rounded-lg mb-4">
                {!isScanning && !thumbprintData && (
                  <>
                    <Fingerprint className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Connect your USB fingerprint scanner and click scan
                    </p>
                    <button
                      onClick={startThumbprintScan}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Start Thumbprint Scan
                    </button>
                  </>
                )}

                {isScanning && (
                  <>
                    <div className="animate-pulse">
                      <Fingerprint className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    </div>
                    <p className="text-blue-600 mb-4">Scanning thumbprint...</p>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </>
                )}

                {thumbprintData && (
                  <>
                    <p className="text-green-600 mb-4">Thumbprint captured successfully!</p>
                    <img
                      src={thumbprintData}
                      alt="Thumbprint"
                      className="mx-auto border border-gray-300 rounded w-32 h-32"
                    />
                    <button
                      onClick={startThumbprintScan}
                      className="mt-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Scan Again
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}