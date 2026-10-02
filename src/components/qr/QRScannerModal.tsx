import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Keyboard, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QRScannerModal: React.FC = () => {
  const { activeScanModal, closeScanner, properties, transactions } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!activeScanModal.isOpen) {
      stopCamera();
      setManualCode('');
      setScanFeedback(null);
      setCameraError(null);
      return;
    }

    startCamera();
    return () => {
      stopCamera();
    };
  }, [activeScanModal.isOpen]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
      } else {
        setCameraError('Camera access not supported on this browser context. Please use manual entry below.');
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access unavailable or permission denied. You can manually enter or select an Asset/Transaction ID below.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleProcessCode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Check if it's a URL like https://sopms.app/scan/property/SB-0001 or BR-2026-0142
    let resolvedId = cleanCode;
    if (cleanCode.includes('/scan/property/')) {
      resolvedId = cleanCode.split('/scan/property/')[1];
    } else if (cleanCode.includes('/scan/borrow/')) {
      resolvedId = cleanCode.split('/scan/borrow/')[1];
    }

    setScanFeedback(`Found code: ${resolvedId}`);

    setTimeout(() => {
      if (activeScanModal.onScan) {
        activeScanModal.onScan(resolvedId);
      }
      closeScanner();
    }, 400);
  };

  if (!activeScanModal.isOpen) return null;

  // Sample quick codes from current DB for instant 1-click test
  const sampleProperties = properties.slice(0, 3);
  const sampleTransactions = transactions.filter(t => t.status === 'BORROWED').slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-slate-800" />
            <h3 className="font-semibold text-slate-900 text-sm">Scan QR Code or Enter Asset ID</h3>
          </div>
          <button
            onClick={closeScanner}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-6 space-y-5">
          <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 px-4 text-center">
                <Camera className="w-10 h-10 mb-2 opacity-50" />
                <span className="text-xs">{cameraError || 'Camera view active'}</span>
              </div>
            )}

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-44 h-44 border-2 border-dashed border-emerald-400/80 rounded-xl relative">
                <div className="absolute inset-0 bg-emerald-400/5" />
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                <div className="absolute inset-x-2 top-1/2 h-0.5 bg-emerald-400/80 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              </div>
            </div>

            {scanFeedback && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-emerald-400 p-4 text-center">
                <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
                <div className="text-sm font-semibold">{scanFeedback}</div>
              </div>
            )}
          </div>

          {/* Manual Input Fallback */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Manual Asset Code or Transaction QR ID:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Keyboard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. SB-0001 or BR-2026-0142"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleProcessCode(manualCode)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={() => handleProcessCode(manualCode)}
                disabled={!manualCode.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
              >
                Scan / Identify
              </button>
            </div>
          </div>

          {/* Quick Demo Test Buttons */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Quick Test Barcodes (1-Click Simulation):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleProperties.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleProcessCode(p.id)}
                  className="text-xs font-mono px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md border border-slate-200 transition-colors"
                >
                  Property: {p.id}
                </button>
              ))}
              {sampleTransactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleProcessCode(t.id)}
                  className="text-xs font-mono px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-md border border-emerald-200 transition-colors"
                >
                  Borrow: {t.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
