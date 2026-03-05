// ============================================================================
// QRCodeScanner.tsx - QR Code Scanner Component with Multiple API Support
// ============================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { FileImage, X, CheckCircle, AlertCircle } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (data: string) => Promise<void>;
  onClose: () => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [scanning, setScanning] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useBarcodeAPI, setUseBarcodeAPI] = useState(false);

  // Check if Barcode Detection API is available
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      setUseBarcodeAPI(true);
    }
  }, []);

  const handleScan = async (result: string) => {
    if (!scanning || success) return;

    try {
      setScanning(false);
      setError(null);
      await onScan(result);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process QR code');
      setScanning(true); // Allow retry
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Use Barcode Detection API if available
      if (useBarcodeAPI && 'BarcodeDetector' in window) {
        const imageBitmap = await createImageBitmap(file);
        const detector = new (window as any).BarcodeDetector({
          formats: ['qr_code']
        });
        const barcodes = await detector.detect(imageBitmap);

        if (barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          await handleScan(rawValue);
        } else {
          setError('No QR code found in image');
        }
      } else {
        // Fallback: try to read as JSON file
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target?.result as string;
            const data = JSON.parse(text);
            // If it's a signature file, extract the data
            if (data.type === 'god_reflection_signature_perceptron') {
              await handleScan(JSON.stringify(data));
            } else {
              setError('Invalid signature file format');
            }
          } catch (err) {
            setError('Failed to read file. Please scan a QR code instead.');
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-green-200">Signature imported successfully!</span>
          </div>
        )}

        {scanning && !success && (
          <>
            <div className="mb-4 bg-black rounded overflow-hidden">
              <Scanner
                onScan={(detectedCodes) => {
                  if (detectedCodes && detectedCodes.length > 0) {
                    const code = detectedCodes[0];
                    handleScan(code.rawValue || '');
                  }
                }}
                onError={(error: any) => {
                  console.error('[QR Scanner] Error:', error);
                  if (error?.message?.includes('Permission')) {
                    setError('Camera permission denied. Please allow camera access and try again.');
                  } else {
                    setError('Camera error: ' + (error?.message || 'Unknown error'));
                  }
                }}
                constraints={{
                  facingMode: 'environment' // Use back camera on mobile
                }}
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-400 mb-3">Or upload a QR code image or JSON file</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <FileImage className="w-5 h-5" />
                Upload Image/File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </>
        )}

        <div className="mt-4 text-xs text-gray-400 text-center">
          {useBarcodeAPI ? (
            <span>Using Barcode Detection API</span>
          ) : (
            <span>Using QR Scanner library</span>
          )}
        </div>
      </div>
    </div>
  );
};

