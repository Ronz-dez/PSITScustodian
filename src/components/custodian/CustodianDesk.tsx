import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  RotateCcw, 
  CheckCircle2, 
  Zap, 
  Layers, 
  QrCode, 
  MapPin, 
  Plus, 
  Eye, 
  FileText,
  WifiOff,
  Wifi,
  Users,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, BorrowTransaction, PropertyRequest, ReturnAssessment } from '../../types';
import { CustodianReviewModal } from './CustodianReviewModal';
import { WalkInBorrowingModal } from './WalkInBorrowingModal';

export const CustodianDesk: React.FC = () => {
  const { 
    properties, 
    requests, 
    transactions, 
    returnAssessments, 
    isOnline, 
    lastSyncedAt, 
    syncPendingCount,
    syncConflictCount,
    reviewRequest,
    releaseApprovedRequest,
    openQrModal
  } = useApp();

  const [reviewModalAssessment, setReviewModalAssessment] = useState<ReturnAssessment | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // Widget metrics
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const activeBorrowings = transactions.filter(t => t.status === 'BORROWED' || t.status === 'OFFLINE_APPROVED');
  const pendingReturns = returnAssessments.filter(a => {
    const tx = transactions.find(t => t.id === a.borrowTransactionId);
    return tx?.status === 'RETURN_PENDING_REVIEW';
  });

  const now = new Date().getTime();
  const overdueItems = transactions.filter(t => {
    if (t.status !== 'BORROWED' && t.status !== 'OFFLINE_APPROVED') return false;
    return new Date(t.expectedReturnDate).getTime() < now;
  });

  const availableCount = properties.filter(p => p.status === 'AVAILABLE').length;
  const maintenanceCount = properties.filter(p => p.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Property Custodian Command Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Centralized operations for remote borrowing reviews, physical release handovers, and return validations.
          </p>
        </div>

        <button
          onClick={() => setIsWalkInOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          + Immediate Walk-In Borrowing
        </button>
      </div>

      {/* KPI / Status Bar Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Pending Requests</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{pendingRequests.length}</div>
          <div className="text-[10px] text-amber-600 mt-0.5 font-medium">Needs remote review</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Active Borrowings</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{activeBorrowings.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Currently on loan</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Overdue Items</div>
          <div className={`text-xl font-bold font-mono mt-0.5 ${overdueItems.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueItems.length}
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5 font-medium">Past expected return</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Return Reviews</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">{pendingReturns.length}</div>
          <div className="text-[10px] text-blue-600 mt-0.5 font-medium">Student returns to verify</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Available In Stock</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">{availableCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{properties.length} total assets</div>
        </div>

        <div className="p-3.5 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Sync & Offline Status</div>
          <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-bold text-slate-800">
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate font-mono">
            {syncPendingCount > 0 ? `${syncPendingCount} queued` : 'Synchronized'}
          </div>
        </div>
      </div>

      {/* Grid: 2 Primary Cockpit Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Widget 1: Pending Online Requests Awaiting Custodian Remote Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                Borrowing Requests Awaiting Approval ({pendingRequests.length})
              </h2>
            </div>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
              No pending student requests at this time.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{req.id} · {req.propertyId}</span>
                    <span className="text-[11px] font-mono text-slate-500">{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800">{req.borrowerName} ({req.borrowerDepartment})</div>
                    <div className="text-slate-600 mt-0.5 line-clamp-1">{req.purpose}</div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>Schedule: {new Date(req.borrowDate).toLocaleDateString()}</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => reviewRequest(req.id, 'APPROVE', 'Approved remotely by custodian.')}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                      >
                        1-Click Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Widget 2: Student Returns Awaiting Custodian Remote Review */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-sm">
                Student Self-Returns to Verify ({pendingReturns.length})
              </h2>
            </div>
          </div>

          {pendingReturns.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
              All student returns have been reviewed and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReturns.map(assessment => (
                <div key={assessment.id} className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{assessment.id} · {assessment.propertyId}</span>
                    <span className="font-mono text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-800 font-bold">
                      Student: {assessment.conditionDeclared}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    Returned by <strong>{assessment.borrowerName}</strong> with {assessment.photoEvidence.length} photo(s).
                  </div>
                  <div className="flex justify-end pt-1 border-t border-blue-100">
                    <button
                      onClick={() => setReviewModalAssessment(assessment)}
                      className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review & Accept / Override
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Active Borrowings & Overdue Items Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-slate-900 text-sm">
              Currently Active Loans & Physical Custody ({activeBorrowings.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Transaction ID</th>
                <th className="px-4 py-2.5 font-semibold">Equipment Name</th>
                <th className="px-4 py-2.5 font-semibold">Borrower Name</th>
                <th className="px-4 py-2.5 font-semibold">Department</th>
                <th className="px-4 py-2.5 font-semibold">Due Date</th>
                <th className="px-4 py-2.5 font-semibold">Status</th>
                <th className="px-4 py-2.5 font-semibold text-right">QR Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeBorrowings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No active property loans out right now.
                  </td>
                </tr>
              ) : (
                activeBorrowings.map(tx => {
                  const isOverdue = new Date(tx.expectedReturnDate).getTime() < now;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-900">{tx.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{tx.propertyName} ({tx.propertyCode})</td>
                      <td className="px-4 py-3 text-slate-700">{tx.borrowerName}</td>
                      <td className="px-4 py-3 text-slate-500">{tx.borrowerDepartment}</td>
                      <td className="px-4 py-3 font-mono">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {new Date(tx.expectedReturnDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                          isOverdue 
                            ? 'bg-rose-100 text-rose-900' 
                            : (tx.status === 'OFFLINE_APPROVED' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900')
                        }`}>
                          {isOverdue ? 'OVERDUE' : tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openQrModal(tx.qrPayload, tx.id, `${tx.propertyName} · Loan: ${tx.borrowerName}`)}
                          className="text-slate-600 hover:text-slate-900 font-mono text-[11px] underline"
                        >
                          Show QR
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalAssessment && (
        <CustodianReviewModal
          assessment={reviewModalAssessment}
          onClose={() => setReviewModalAssessment(null)}
        />
      )}

      {/* Walk-in Modal */}
      {isWalkInOpen && (
        <WalkInBorrowingModal
          onClose={() => setIsWalkInOpen(false)}
        />
      )}

    </div>
  );
};
