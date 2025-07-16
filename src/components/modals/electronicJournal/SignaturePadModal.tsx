import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'signature_pad';
import { X, Save, Download } from 'lucide-react';

interface SignaturePadModalProps {
  onClose: () => void;
  onSave: (signature: string) => void;
}

export default function SignaturePadModal({ onClose, onSave }: SignaturePadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // For high-DPI screens
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = 600 * ratio;
    canvas.height = 200 * ratio;
    canvas.getContext('2d')?.scale(ratio, ratio);

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: 'rgb(255,255,255)',
      penColor: 'black',
    });

    signaturePadRef.current = signaturePad;

    return () => {
      signaturePad.off();
    };
  }, []);

  const clearSignature = () => {
    signaturePadRef.current?.clear();
    setPreviewImage(null);
  };

  const saveSignature = () => {
    if (signaturePadRef.current?.isEmpty()) {
      alert('Please provide a signature first.');
      return;
    }
    const dataUrl = signaturePadRef.current.toDataURL();
    setPreviewImage(dataUrl);
    onSave(dataUrl);
  };

  const downloadSignature = () => {
    if (!previewImage) return;

    const link = document.createElement('a');
    link.href = previewImage;
    link.download = 'signature.png';
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Digital Signature Pad</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Canvas */}
        <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
          <canvas
            ref={canvasRef}
            width={600}
            height={200}
            className="w-full border border-gray-200 rounded cursor-crosshair bg-white"
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            Sign above using your mouse or touch device
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mb-4">
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

        {/* Preview & Download */}
        {previewImage && (
          <div className="border-t pt-4 text-center">
            <p className="text-sm text-gray-600 mb-2">Preview of Saved Signature:</p>
            <img
              src={previewImage}
              alt="Signature Preview"
              className="mx-auto border border-gray-300 rounded mb-3"
              style={{ maxHeight: '150px' }}
            />
            <button
              onClick={downloadSignature}
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Signature
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
