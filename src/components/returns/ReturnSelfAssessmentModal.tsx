import React, { useState, useRef } from 'react';
import { 
  X, 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ShieldCheck, 
  Trash2,
  FileCheck,
  WifiOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { BorrowTransaction, PropertyCondition } from '../../types';

interface ReturnSelfAssessmentModalProps {
  transaction: BorrowTransaction | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReturnSelfAssessmentModal: React.FC<ReturnSelfAssessmentModalProps> = ({
  transaction,
  onClose,
  onSuccess
}) => {
  const { currentUser, submitReturnAssessment, isOnline } = useApp();

  const [condition, setCondition] = useState<PropertyCondition>('GOOD');
  const [descriptionNotes, setDescriptionNotes] = useState('');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState(true);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  if (!transaction) return null;

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        setIsCapturingCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera error:', err);
      alert('Camera access denied. Please use the file upload option.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setPhotos(prev => [...prev, dataUrl]);
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCapturingCamera(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) return;

    if ((condition === 'MINOR_DAMAGE' || condition === 'MAJOR_DAMAGE') && !descriptionNotes.trim()) {
      alert('Please describe the damage observed on the equipment.');
      return;
    }

    setIsSubmitting(true);
    try {
      submitReturnAssessment({
        borrowTransactionId: transaction.id,
        propertyId: transaction.propertyId,
        borrowerId: currentUser.id,
        borrowerName: currentUser.name,
        conditionDeclared: condition,
        descriptionNotes: descriptionNotes.trim() || 'No issues encountered during usage.',
        photoEvidence: photos,
        accessoriesIncluded,
        declarationAccepted: true
      });

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error submitting return assessment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Student Return Self-Assessment
            </h3>
            <div className="text-xs text-slate-500 font-mono">
              Transaction: {transaction.id} · Asset: {transaction.propertyCode}
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">Return Assessment Submitted</h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                Your declared condition has been recorded. The Property Custodian can now review and close this borrowing transaction remotely.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Declared Condition:</span>
                <span className="font-bold font-mono text-slate-900">{condition}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evidence Attached:</span>
                <span>{photos.length} Photo(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Accountability Declaration:</span>
                <span className="text-emerald-700 font-semibold">Accepted & Signed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sync Status:</span>
                <span className="font-mono">{isOnline ? 'Transmitted to Server' : 'Queued in IndexedDB (Offline)'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Context Item Banner */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
              <div>
                <div className="font-semibold text-slate-900">{transaction.propertyName}</div>
                <div className="text-[11px] text-slate-500">
                  Borrowed by: {transaction.borrowerName} ({transaction.borrowerDepartment})
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[11px] text-slate-500">Due: {new Date(transaction.expectedReturnDate).toLocaleDateString()}</div>
                <div className="text-[10px] text-emerald-700 font-medium">Original Release: {transaction.releaseCondition}</div>
              </div>
            </div>

            {!isOnline && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 text-xs text-amber-900">
                <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Operating Offline: Return assessment and photos will be queued locally on this device.</span>
              </div>
            )}

            {/* Condition Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2">
                1. Select Observed Condition of Equipment <span className="text-rose-500">*</span>:
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: 'GOOD', label: 'Good / Flawless', desc: 'Fully functional, no damage' },
                  { value: 'MINOR_DAMAGE', label: 'Minor Damage', desc: 'Scratches, loose knob' },
                  { value: 'MAJOR_DAMAGE', label: 'Major Damage', desc: 'Broken port, dent, fault' },
                  { value: 'MISSING', label: 'Missing Item', desc: 'Lost / stolen asset' }
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setCondition(item.value as PropertyCondition)}
                    className={`p-3 text-left rounded-lg border text-xs transition-all flex flex-col justify-between ${
                      condition === item.value 
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="font-bold">{item.label}</div>
                    <div className={`text-[10px] mt-1 ${condition === item.value ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accessory checklist */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={accessoriesIncluded}
                  onChange={(e) => setAccessoriesIncluded(e.target.checked)}
                  className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
                />
                <span className="font-medium">
                  All cables, power leads, remotes, and storage cases are included in the return
                </span>
              </label>
            </div>

            {/* Condition Notes & Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                2. Operational Notes / Damage Details:
              </label>
              <textarea
                rows={2}
                placeholder={condition === 'GOOD' ? "e.g. Tested sound and battery before return. No issues." : "Explain any scratches, dent location, or functional issues..."}
                value={descriptionNotes}
                onChange={(e) => setDescriptionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Photo Capture & Upload Evidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-900">
                  3. Photographic Evidence {condition !== 'GOOD' && <span className="text-rose-500 font-bold">(Required for Damaged items)</span>}:
                </label>
                <div className="text-[11px] text-slate-500">{photos.length} photo(s) captured</div>
              </div>

              {/* Camera Preview Area */}
              {isCapturingCamera && (
                <div className="mb-3 p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col items-center">
                  <video ref={videoRef} className="w-full max-h-52 object-cover rounded bg-black mb-2" playsInline muted />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md shadow-xs"
                    >
                      Snap Photo
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-md"
                    >
                      Cancel Camera
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Upload / Trigger Buttons */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-700" />
                  Capture Camera Photo
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-700" />
                  Upload from Device
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 0 && (
                <div className="grid grid-cols-4 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {photos.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded overflow-hidden border border-slate-200 group">
                      <img src={src} alt={`evidence-${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-slate-900/80 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formal Student Declaration Check */}
            <div className="p-3.5 bg-slate-900 text-white rounded-lg space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Student Accountability & Condition Declaration</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                "I hereby confirm and declare that the reported condition accurately represents the physical, structural, and operational state of the organization property at the time of return."
              </p>
              <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded border-slate-600 focus:ring-emerald-400"
                />
                <span className="font-semibold text-white">
                  I accept and digitally sign this declaration ({currentUser.name})
                </span>
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  onClose();
                }}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !declarationAccepted}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                {isSubmitting ? 'Submitting Assessment...' : 'Submit Self-Assessment'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
