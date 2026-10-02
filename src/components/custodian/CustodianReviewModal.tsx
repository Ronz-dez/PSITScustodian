import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Eye, 
  ArrowRight, 
  User, 
  Clock, 
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReturnAssessment, PropertyCondition, BorrowTransaction } from '../../types';

interface CustodianReviewModalProps {
  assessment: ReturnAssessment | null;
  transaction?: BorrowTransaction;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CustodianReviewModal: React.FC<CustodianReviewModalProps> = ({
  assessment,
  transaction,
  onClose,
  onSuccess
}) => {
  const { currentUser, reviewReturnAssessment, properties } = useApp();

  const [decision, setDecision] = useState<'ACCEPT' | 'OVERRIDE'>('ACCEPT');
  const [overrideCondition, setOverrideCondition] = useState<PropertyCondition>('MINOR_DAMAGE');
  const [overrideReason, setOverrideReason] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [maintenanceRecommended, setMaintenanceRecommended] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!assessment) return null;

  const property = properties.find(p => p.id === assessment.propertyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decision === 'OVERRIDE' && !overrideReason.trim()) {
      alert('A reason is mandatory when overriding a student self-assessment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCond = decision === 'ACCEPT' ? assessment.conditionDeclared : overrideCondition;
      
      reviewReturnAssessment({
        returnAssessmentId: assessment.id,
        borrowTransactionId: assessment.borrowTransactionId,
        decision,
        finalCondition: finalCond,
        overrideReason: decision === 'OVERRIDE' ? overrideReason.trim() : undefined,
        conditionNotes: conditionNotes.trim() || undefined,
        maintenanceRecommended: maintenanceRecommended || finalCond === 'MAJOR_DAMAGE'
      });

      setIsDone(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error submitting custodian review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              Remote Return Assessment Review
            </h3>
            <div className="text-xs text-slate-500 font-mono">
              Return Assessment: {assessment.id} · Asset: {assessment.propertyId}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-lg">
                {decision === 'ACCEPT' ? 'Assessment Accepted & Closed' : 'Assessment Overridden & Logged'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                The chain of custody has been updated and registered in the immutable audit trail.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 font-mono">
                <span className="text-slate-500">Chain:</span>
                <span className="font-semibold">
                  Student: [{assessment.conditionDeclared}] ➔ Final: [{decision === 'ACCEPT' ? assessment.conditionDeclared : overrideCondition}]
                </span>
              </div>
              <div><strong>Custodian:</strong> {currentUser.name}</div>
              {decision === 'OVERRIDE' && (
                <div><strong>Override Reason:</strong> {overrideReason}</div>
              )}
              <div><strong>Property Status:</strong> Updated in central registry</div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Close & Back to Review Queue
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            
            {/* Student Submission Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-900">{assessment.borrowerName}</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(assessment.submittedAt).toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Student Declared:</div>
                  <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                    {assessment.conditionDeclared}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Accessories Returned:</div>
                  <div className="font-semibold text-emerald-700 mt-0.5">
                    {assessment.accessoriesIncluded ? '✓ Complete & Intact' : '⚠ Missing Parts'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Student Declaration:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    ✓ Accepted by Student
                  </div>
                </div>
              </div>

              {assessment.descriptionNotes && (
                <div className="text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                  <span className="font-semibold text-slate-900">Student Notes: </span>
                  {assessment.descriptionNotes}
                </div>
              )}

              {/* Photos Gallery */}
              {assessment.photoEvidence.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                    <span>Student Photo Evidence ({assessment.photoEvidence.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal">Click to enlarge</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {assessment.photoEvidence.map((src, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhoto(src)}
                        className="w-16 h-16 rounded-md overflow-hidden border border-slate-300 shrink-0 hover:ring-2 hover:ring-slate-900 transition-all"
                      >
                        <img src={src} alt="evidence" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Photo Preview Lightbox */}
            {selectedPhoto && (
              <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
                <div className="relative max-w-xl max-h-[85vh] bg-black rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                  <img src={selectedPhoto} alt="enlarged evidence" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Custodian Review Action Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2">
                Custodian Review Decision:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('ACCEPT')}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    decision === 'ACCEPT' 
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950">Accept Student Assessment</span>
                    {decision === 'ACCEPT' && <Check className="w-4 h-4 text-emerald-700" />}
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Confirm student's declared condition [{assessment.conditionDeclared}] as accurate.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('OVERRIDE')}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    decision === 'OVERRIDE' 
                      ? 'border-rose-600 bg-rose-50/50 ring-1 ring-rose-600' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-950">Override Assessment</span>
                    {decision === 'OVERRIDE' && <AlertTriangle className="w-4 h-4 text-rose-700" />}
                  </div>
                  <p className="text-[11px] text-rose-800 mt-1">
                    Student declaration inaccurate; specify corrected condition and reason.
                  </p>
                </button>
              </div>
            </div>

            {/* Override Fields (if decision is OVERRIDE) */}
            {decision === 'OVERRIDE' && (
              <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-lg space-y-3 animate-in fade-in duration-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-950">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  <span>Specify Override Details</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Corrected Final Condition <span className="text-rose-600">*</span>:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['GOOD', 'MINOR_DAMAGE', 'MAJOR_DAMAGE', 'MISSING'] as PropertyCondition[])
                      .filter(c => c !== assessment.conditionDeclared)
                      .map((cond) => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setOverrideCondition(cond)}
                          className={`py-1.5 px-2 text-xs font-mono rounded border transition-colors ${
                            overrideCondition === cond 
                              ? 'bg-rose-900 text-white font-bold border-rose-900' 
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {cond}
                        </button>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Mandatory Override Reason & Audit Note <span className="text-rose-600">*</span>:
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Scratches observed on casing; loose auxiliary knob discovered during custodian inspection."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-rose-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Additional Custodian Internal Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custodian Remarks & Storage Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Returned to Locker A, ready for next scheduled event."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Maintenance Toggle */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceRecommended}
                  onChange={(e) => setMaintenanceRecommended(e.target.checked)}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-slate-900"
                />
                <span className="font-medium text-slate-800">
                  Send property to Maintenance / Repair bench before making available
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (decision === 'OVERRIDE' && !overrideReason.trim())}
                className={`px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                  decision === 'OVERRIDE' 
                    ? 'bg-rose-900 hover:bg-rose-800' 
                    : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {isSubmitting ? 'Recording...' : (decision === 'ACCEPT' ? 'Accept Assessment & Close' : 'Confirm Override & Log')}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
