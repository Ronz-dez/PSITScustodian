import React, { useState } from 'react';
import { 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Camera, 
  User, 
  Check, 
  X,
  FileCheck,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReturnAssessment, BorrowTransaction, CustodianReview } from '../../types';
import { CustodianReviewModal } from '../custodian/CustodianReviewModal';
import { ReturnSelfAssessmentModal } from './ReturnSelfAssessmentModal';

export const ReturnReviewsView: React.FC = () => {
  const { 
    currentUser, 
    transactions, 
    returnAssessments, 
    custodianReviews, 
    openScanner, 
    openQrModal 
  } = useApp();

  const [selectedReviewAssessment, setSelectedReviewAssessment] = useState<ReturnAssessment | null>(null);
  const [selectedReturnTx, setSelectedReturnTx] = useState<BorrowTransaction | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const isCustodian = currentUser.role === 'CUSTODIAN' || currentUser.role === 'ORG_ADMIN' || currentUser.role === 'SYSTEM_ADMIN';

  // Items currently borrowed that student can return
  const activeStudentBorrowings = transactions.filter(t => 
    t.status === 'BORROWED' && (isCustodian || t.borrowerId === currentUser.id)
  );

  // Return assessments pending review (transactions with status RETURN_PENDING_REVIEW)
  const pendingAssessments = returnAssessments.filter(a => {
    const tx = transactions.find(t => t.id === a.borrowTransactionId);
    return tx?.status === 'RETURN_PENDING_REVIEW';
  });

  // Completed reviews
  const completedAssessments = returnAssessments.filter(a => {
    const tx = transactions.find(t => t.id === a.borrowTransactionId);
    return tx?.status === 'RETURNED';
  });

  const getReviewForAssessment = (assessmentId: string): CustodianReview | undefined => {
    return custodianReviews.find(r => r.returnAssessmentId === assessmentId);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Return Self-Assessment & Custodian Review Chain
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Students perform condition declarations with photographic evidence; property custodians validate or override remotely.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openScanner((code) => {
              const tx = transactions.find(t => t.id === code || t.propertyCode === code || t.propertyId === code);
              if (tx && tx.status === 'BORROWED') {
                setSelectedReturnTx(tx);
              } else {
                alert(`Scanned code: ${code}. Select an active loan below to initiate return assessment.`);
              }
            })}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            Scan QR to Return
          </button>
        </div>
      </div>

      {/* Section 1: Active Loans Eligible for Self-Return */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-slate-900 text-sm">
              Active Loans Eligible for Return Submission ({activeStudentBorrowings.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {isCustodian ? 'All currently out loans' : 'Your active loans'}
          </span>
        </div>

        {activeStudentBorrowings.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-100">
            No active loans currently checked out.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeStudentBorrowings.map(tx => (
              <div 
                key={tx.id} 
                className="p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex flex-col justify-between space-y-3 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-900">{tx.propertyCode}</span>
                    <span className="font-mono text-[11px] text-slate-500">{tx.id}</span>
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-1 truncate">
                    {tx.propertyName}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Borrower: {tx.borrowerName} ({tx.borrowerDepartment})
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReturnTx(tx)}
                  className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  Complete Return Assessment
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Returns Awaiting Custodian Remote Review */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h2 className="font-bold text-slate-900 text-sm">
              Student Submissions Awaiting Custodian Review ({pendingAssessments.length})
            </h2>
          </div>
          <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
            Requires Custodian Verification
          </span>
        </div>

        {pendingAssessments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <div className="font-semibold text-slate-800">No return assessments pending review</div>
            <p className="text-slate-400 mt-0.5">All student return declarations have been reviewed and closed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAssessments.map(assessment => {
              const tx = transactions.find(t => t.id === assessment.borrowTransactionId);
              return (
                <div 
                  key={assessment.id} 
                  className="p-4 bg-amber-50/30 border border-amber-200 rounded-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-900">{assessment.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">{tx?.propertyName || assessment.propertyId}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Submitted by <strong>{assessment.borrowerName}</strong> on {new Date(assessment.submittedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-900">
                        Declared: {assessment.conditionDeclared}
                      </span>
                      {isCustodian ? (
                        <button
                          onClick={() => setSelectedReviewAssessment(assessment)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Review & Decide
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Waiting for Custodian</span>
                      )}
                    </div>
                  </div>

                  {/* Description & evidence overview */}
                  <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-800">Student Note: </span>
                      {assessment.descriptionNotes}
                    </div>

                    {assessment.photoEvidence.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="text-[11px] text-slate-500">Attached Photos:</span>
                        {assessment.photoEvidence.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedPhoto(src)}
                            className="w-10 h-10 rounded border border-slate-300 overflow-hidden hover:opacity-80"
                          >
                            <img src={src} alt="proof" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Immutable Return Chain Audit (Completed Reviews) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h2 className="font-bold text-slate-900 text-sm">
              Immutable Chain of Custody History ({completedAssessments.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Student Assessment ➔ Custodian Review ➔ Final Status
          </span>
        </div>

        {completedAssessments.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No completed return review chains recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {completedAssessments.map(assessment => {
              const review = getReviewForAssessment(assessment.id);
              const tx = transactions.find(t => t.id === assessment.borrowTransactionId);
              const isOverridden = review?.decision === 'OVERRIDE';

              return (
                <div 
                  key={assessment.id} 
                  className={`p-4 rounded-xl border space-y-3 text-xs ${
                    isOverridden ? 'bg-rose-50/30 border-rose-200' : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{assessment.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">{tx?.propertyName || assessment.propertyId}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Borrower: {assessment.borrowerName} · Transaction: {assessment.borrowTransactionId}
                      </div>
                    </div>

                    {/* Chain Badge */}
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700">
                        Student: {assessment.conditionDeclared}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isOverridden 
                          ? 'bg-rose-100 text-rose-900 border border-rose-300' 
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        Final: {review?.finalCondition || assessment.conditionDeclared}
                      </span>
                    </div>
                  </div>

                  {/* Chain Details Box (from Section 9 spec) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-slate-200 text-slate-700">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Student Self-Assessment
                      </div>
                      <div><strong>Condition:</strong> {assessment.conditionDeclared}</div>
                      <div><strong>Submitted:</strong> {new Date(assessment.submittedAt).toLocaleString()}</div>
                      <div><strong>Photos:</strong> {assessment.photoEvidence.length} captured</div>
                      {assessment.descriptionNotes && (
                        <div className="text-[11px] text-slate-500 mt-1 italic">"{assessment.descriptionNotes}"</div>
                      )}
                    </div>

                    <div className="border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Custodian Verification & Review
                      </div>
                      <div>
                        <strong>Decision:</strong>{' '}
                        <span className={isOverridden ? 'text-rose-700 font-bold' : 'text-emerald-700 font-bold'}>
                          {review?.decision || 'ACCEPTED'}
                        </span>
                      </div>
                      <div><strong>Reviewed By:</strong> {review?.custodianName || 'Prof. Alex Rivera'}</div>
                      <div><strong>Review Timestamp:</strong> {review ? new Date(review.reviewedAt).toLocaleString() : 'Recorded'}</div>
                      {review?.overrideReason && (
                        <div className="text-[11px] text-rose-800 bg-rose-50 p-1.5 rounded mt-1">
                          <strong>Override Reason:</strong> {review.overrideReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox photo viewer */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-xl max-h-[85vh] bg-black rounded-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <img src={selectedPhoto} alt="evidence preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedReviewAssessment && (
        <CustodianReviewModal
          assessment={selectedReviewAssessment}
          onClose={() => setSelectedReviewAssessment(null)}
        />
      )}

      {/* Return Self-Assessment Modal */}
      {selectedReturnTx && (
        <ReturnSelfAssessmentModal
          transaction={selectedReturnTx}
          onClose={() => setSelectedReturnTx(null)}
        />
      )}

    </div>
  );
};
