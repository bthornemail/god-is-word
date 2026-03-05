// ============================================================================
// QRCodeDisplay.tsx - QR Code Display Component
// ============================================================================

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';

interface QRCodeDisplayProps {
  data: string | object;
  title?: string;
  onDownload?: () => void;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  data, 
  title = 'QR Code',
  onDownload,
  size = 400
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Convert object to JSON string if needed
  const qrValue = typeof data === 'string' ? data : JSON.stringify(data);

  const downloadQR = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-code-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          if (onDownload) onDownload();
        }
      });
    };

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;
  };

  return (
    <div className="qr-display-container text-center">
      {title && (
        <h3 className="text-xl mb-3 font-semibold">{title}</h3>
      )}
      <div ref={qrRef} className="flex justify-center bg-white p-4 rounded inline-block">
        <QRCodeSVG
          value={qrValue}
          size={size}
          level="H" // High error correction
          includeMargin={true}
        />
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={downloadQR}
          className="btn btn-secondary inline-flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download QR
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(qrValue);
            alert('QR code data copied to clipboard!');
          }}
          className="btn inline-flex items-center gap-2"
        >
          <Share2 className="w-5 h-5" />
          Copy Data
        </button>
      </div>
    </div>
  );
};

