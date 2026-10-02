import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  QrCode, 
  User, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  Send,
  RotateCcw,
  Check,
  X,
  FileEdit,
  HandMetal,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowTransaction, PropertyRequest, PropertyCondition } from '../../types';
import { ReturnSelfAssessmentModal } from '../returns/ReturnSelfAssessmentModal';

export const BorrowingsList: React.FC = () => {
  const { 
    currentUser, 
    requests, 
    transactions, 
    reviewRequest, 
    releaseApprovedRequest, 
    openQrModal 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'ACTIVE' | 'PENDING_REQUESTS' | 'HISTORY'>('ACTIVE');
  const [selectedReturnTx, setSelectedReturnTx] = useState<BorrowTransaction | null>(null);

  // Custodian action modals
  const [rejectingRequest, setRejectingRequest] = useState<PropertyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [revisingRequest, setRevisingRequest] = useState<PropertyRequest | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [releasingRequest, setReleasingRequest] = useState<PropertyRequest | null>(null);
  const [releaseCondition, setReleaseCondition] = useState<PropertyCondition>('GOOD');
  const [releaseNotes, setReleaseNotes] = useState('');

  const isCustodian = currentUser.role === 'CUSTODIAN' || currentUser.role === 'ORG_ADMIN' || currentUser.role === 'SYSTEM_ADMIN';

  // Filter requests & transactions
  const userRequests = isCustodian ? requests : requests.filter(r => r.borrowerId === currentUser.id);
  const userTransactions = isCustodian ? transactions : transactions.filter(t => t.borrowerId === currentUser.id);

  const activeBorrowings = userTransactions.filter(t => t.status === 'BORROWED' || t.status === 'OFFLINE_APPROVED');
  const pendingRequests = userRequests.filter(r => r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'REVISION_REQUIRED');
  const completedHistory = userTransactions.filter(t => t.status === 'RETURNED');

  const getOverdueStatus = (expectedReturnStr: string) => {
    const diff = new Date(expectedReturnStr).getTime() - new Date().getTime();
    if (diff < 0) {
      const hoursAgo = Math.abs(Math.round(diff / (1000 * 60 * 60)));
      return { isOverdue: true, label: `Overdue by ${hoursAgo} hr(s)` };
    }
    const hoursLeft = Math.round(diff / (1000 * 60 * 60));
    if (hoursLeft <= 12) {
      return { isOverdue: false, isNear: true, label: `Due in ${hoursLeft} hr(s)` };
    }
    return { isOverdue: false, isNear: false, label: `Due on ${new Date(expectedReturnStr).toLocaleDateString()}` };
  };

  const handleApprove = (reqId: string) => {
    reviewRequest(reqId, 'APPROVE', 'Approved for release.');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingRequest || !rejectionReason.trim()) return;
    reviewRequest(rejectingRequest.id, 'REJECT', rejectionReason.trim());
    setRejectingRequest(null);
    setRejectionReason('');
  };

  const handleConfirmRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisingRequest || !revisionNotes.trim()) return;
    reviewRequest(revisingRequest.id, 'REVISION_REQUIRED', revisionNotes.trim());
    setRevisingRequest(null);
    setRevisionNotes('');
  };

  const handleConfirmRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!releasingRequest) return;
    releaseApprovedRequest(releasingRequest.id, releaseCondition, releaseNotes.trim());
    setReleasingRequest(null);
    setReleaseNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Borrowings & Request Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isCustodian 
              ? 'Review pending borrower requests remotely, authorize physical handovers, and track active loans.'
              : 'Track your organization loans, retrieve claiming QR tokens, and initiate return self-assessments.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveSubTab('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Loans ({activeBorrowings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('PENDING_REQUESTS')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'PENDING_REQUESTS'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Requests Queue ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('HISTORY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeSubTab === 'HISTORY'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Returned History ({completedHistory.length})
          </button>
        </div>
      </div>

      {/* View 1: Active Borrowings */}
      {activeSubTab === 'ACTIVE' && (
        <div className="space-y-4">
          {activeBorrowings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">No active equipment loans right now</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Items currently borrowed will appear here with live return countdowns and QR inspection triggers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBorrowings.map(tx => {
                const overdue = getOverdueStatus(tx.expectedReturnDate);
                return (
                  <div 
                    key={tx.id} 
                    className={`bg-white rounded-xl border p-5 flex flex-col justify-between transition-all ${
                      overdue.isOverdue ? 'border-rose-300 ring-1 ring-rose-300' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Top status bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-slate-900">{tx.id}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-600">{tx.propertyCode}</span>
                        </div>

                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          overdue.isOverdue 
                            ? 'bg-rose-100 text-rose-800' 
                            : (overdue.isNear ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')
                        }`}>
                          {overdue.label}
                        </span>
                      </div>

                      {/* Equipment title & borrower */}
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{tx.propertyName}</h3>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{tx.borrowerName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{tx.borrowerDepartment}</span>
                        </div>
                      </div>

                      {/* Purpose */}
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div className="font-semibold text-slate-700 text-[11px] mb-0.5">Loan Purpose:</div>
                        <p>{tx.purpose}</p>
                      </div>

                      {/* Dates & Handover notes */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                        <div>
                          <span className="text-slate-400 block">Released On:</span>
                          <span className="font-mono">{tx.actualReleaseDate ? new Date(tx.actualReleaseDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Initial Condition:</span>
                          <span className="font-mono font-semibold text-slate-800">{tx.releaseCondition}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => openQrModal(tx.qrPayload, tx.id, `${tx.propertyName} (Borrower: ${tx.borrowerName})`)}
                        className="p-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                        title="Display Borrowing Transaction QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Transaction QR</span>
                      </button>

                      <button
                        onClick={() => setSelectedReturnTx(tx)}
                        className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Start Return Self-Assessment</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 2: Requests Queue (Pending, Approved, Revision) */}
      {activeSubTab === 'PENDING_REQUESTS' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">All requests are up to date</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                New borrowing requests submitted by students will appear here for custodian remote evaluation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const isRevision = req.status === 'REVISION_REQUIRED';

                return (
                  <div 
                    key={req.id} 
                    className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{req.id}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-xs text-slate-600">Asset: {req.propertyId}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Submitted on {new Date(req.createdAt).toLocaleString()} by <strong>{req.borrowerName}</strong> ({req.borrowerDepartment})
                        </div>
                      </div>

                      {/* Status indicator */}
                      <div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                          isPending 
                            ? 'bg-amber-100 text-amber-900 border border-amber-200' 
                            : (isApproved ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-blue-100 text-blue-900')
                        }`}>
                          {isPending ? 'Pending Custodian Review' : (isApproved ? 'Approved - Awaiting Pickup' : 'Revision Required')}
                        </span>
                      </div>
                    </div>

                    {/* Purpose and Event */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        {req.eventTitle && (
                          <div>
                            <span className="text-slate-400 text-[11px]">Event: </span>
                            <span className="font-semibold text-slate-800">{req.eventTitle}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-400 text-[11px]">Purpose: </span>
                          <span className="text-slate-700">{req.purpose}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px]">Responsible Officer: </span>
                          <span className="font-medium text-slate-800">{req.responsiblePerson} ({req.contactNumber})</span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Requested Borrow Date:</span>
                          <span className="font-mono font-medium">{new Date(req.borrowDate).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expected Return:</span>
                          <span className="font-mono font-medium">{new Date(req.expectedReturnDate).toLocaleString()}</span>
                        </div>
                        {req.remarks && (
                          <div className="pt-1 border-t border-slate-200 text-slate-600">
                            <strong>Note:</strong> {req.remarks}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Custodian feedback notes if any */}
                    {req.revisionNotes && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900">
                        <strong>Custodian Revision Instructions:</strong> {req.revisionNotes}
                      </div>
                    )}

                    {/* Actions Bar for Custodian or Student */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                      
                      {/* Custodian Remote Approval Options */}
                      {isCustodian && isPending && (
                        <>
                          <button
                            onClick={() => setRejectingRequest(req)}
                            className="px-3 py-1.5 text-xs font-medium text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Reject Request
                          </button>
                          <button
                            onClick={() => setRevisingRequest(req)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            Request Revision
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Remotely
                          </button>
                        </>
                      )}

                      {/* If Approved, Handover / Release Action */}
                      {isApproved && isCustodian && (
                        <button
                          onClick={() => setReleasingRequest(req)}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg shadow-xs flex items-center gap-1.5"
                        >
                          <HandMetal className="w-3.5 h-3.5" />
                          Hand Over & Release Equipment
                        </button>
                      )}

                      {/* If Approved, Student can show QR Token */}
                      {isApproved && !isCustodian && (
                        <button
                          onClick={() => openQrModal(`CLAIM_${req.id}`, `Claiming Token: ${req.id}`, `Present this to Custodian at Dept Office`)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 flex items-center gap-1.5"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Show Pickup QR Token
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* View 3: Returned History */}
      {activeSubTab === 'HISTORY' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Equipment</th>
                <th className="px-4 py-3 font-semibold">Borrower</th>
                <th className="px-4 py-3 font-semibold">Returned Date</th>
                <th className="px-4 py-3 font-semibold">Final Condition</th>
                <th className="px-4 py-3 font-semibold text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No completed loan records available yet.
                  </td>
                </tr>
              ) : (
                completedHistory.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{tx.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{tx.propertyName}</td>
                    <td className="px-4 py-3 text-slate-600">{tx.borrowerName} ({tx.borrowerDepartment})</td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {tx.actualReturnDate ? new Date(tx.actualReturnDate).toLocaleDateString() : 'Recorded'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-slate-900">
                        {tx.finalCondition || 'GOOD'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => openQrModal(tx.qrPayload, tx.id, `Archive Record · Returned on ${tx.actualReturnDate ? new Date(tx.actualReturnDate).toLocaleDateString() : 'N/A'}`)}
                        className="text-slate-500 hover:text-slate-900 font-mono text-[11px] underline"
                      >
                        QR Token
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Return Self-Assessment Modal */}
      {selectedReturnTx && (
        <ReturnSelfAssessmentModal
          transaction={selectedReturnTx}
          onClose={() => setSelectedReturnTx(null)}
        />
      )}

      {/* Reject Modal */}
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Reject Borrowing Request</h3>
            <p className="text-xs text-slate-500">
              Provide a clear reason why request <strong>{rejectingRequest.id}</strong> is denied so the student is notified.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Equipment scheduled for department accreditation inspection on this date."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRejectingRequest(null)} className="px-3 py-1.5 text-xs text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-lg">
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {revisingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Request Revision from Borrower</h3>
            <p className="text-xs text-slate-500">
              Return request <strong>{revisingRequest.id}</strong> to the student with required corrections.
            </p>
            <form onSubmit={handleConfirmRevision} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="e.g. Please adjust return time to 5:00 PM before office lockup."
                value={revisionNotes}
                onChange={e => setRevisionNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setRevisingRequest(null)} className="px-3 py-1.5 text-xs text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-lg">
                  Send Revision Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Release Modal */}
      {releasingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Physical Handover & Equipment Release</h3>
            <p className="text-xs text-slate-500">
              Releasing <strong>{releasingRequest.propertyId}</strong> to <strong>{releasingRequest.borrowerName}</strong>.
            </p>
            <form onSubmit={handleConfirmRelease} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Release Condition:</label>
                <select
                  value={releaseCondition}
                  onChange={e => setReleaseCondition(e.target.value as PropertyCondition)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                >
                  <option value="GOOD">GOOD</option>
                  <option value="MINOR_DAMAGE">MINOR_DAMAGE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Handover Notes:</label>
                <input
                  type="text"
                  placeholder="e.g. Verified battery full charge, handed 1x power supply"
                  value={releaseNotes}
                  onChange={e => setReleaseNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setReleasingRequest(null)} className="px-3 py-1.5 text-xs text-slate-600">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
                  Confirm Handover & Start Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
