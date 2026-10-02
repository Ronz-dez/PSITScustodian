import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, QrCode } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QRGeneratorModal: React.FC = () => {
  const { activeQrModal, closeQrModal } = useApp();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeQrModal.isOpen && activeQrModal.payload && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        activeQrModal.payload,
        {
          width: 240,
          margin: 1.5,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [activeQrModal]);

  if (!activeQrModal.isOpen || !activeQrModal.payload) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = `QR_${activeQrModal.title || 'asset'}.png`;
    a.href = url;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-slate-700" />
            <h3 className="font-semibold text-slate-900 text-sm">Official Property QR Code</h3>
          </div>
          <button
            onClick={closeQrModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Badge for Print */}
        <div className="p-6 flex flex-col items-center text-center">
          <div className="border border-slate-300 rounded-lg p-5 bg-white shadow-xs max-w-[280px] w-full flex flex-col items-center print-container">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              STUDENT ORG PROPERTY
            </div>
            <div className="font-bold text-slate-900 text-base mb-1 truncate max-w-full">
              {activeQrModal.title || 'Property Identification'}
            </div>
            
            <div className="my-2 bg-white p-2 border border-slate-200 rounded-md">
              <canvas ref={canvasRef} className="w-48 h-48 block" />
            </div>

            <div className="font-mono font-semibold text-slate-800 text-sm bg-slate-100 px-3 py-1 rounded-md mt-1 w-full truncate">
              {activeQrModal.payload}
            </div>

            {activeQrModal.subtitle && (
              <div className="text-xs text-slate-500 mt-2 line-clamp-2">
                {activeQrModal.subtitle}
              </div>
            )}
            
            <div className="text-[10px] text-slate-400 mt-2">
              Scan with SOPMS App or Mobile Camera
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 w-full max-w-[280px]">
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Label
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
