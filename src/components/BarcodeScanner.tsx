import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onResult, onClose }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Initialize scanner
    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        rememberLastUsedCamera: true,
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Stop scanning on success
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
        onResult(decodedText);
      },
      (error) => {
        // Ignore errors (usually just means no code found yet)
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error('Failed to clear scanner', error);
        });
      }
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-gray-400 hover:text-white hover:bg-leica-red transition-colors"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-xl font-bold mb-4 text-center">สแกน QR / Barcode</h2>
        
        <div className="bg-black rounded-xl overflow-hidden">
          <div id="reader" className="w-full"></div>
        </div>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          หันกล้องไปที่บาร์โค้ดหรือคิวอาร์โค้ด
        </p>
      </div>
    </div>
  );
}
