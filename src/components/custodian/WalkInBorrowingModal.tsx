import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  WifiOff, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PropertyCondition, Property } from '../../types';

interface WalkInBorrowingModalProps {
  initialProperty?: Property;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WalkInBorrowingModal: React.FC<WalkInBorrowingModalProps> = ({
  initialProperty,
  onClose,
  onSuccess
}) => {
  const { 
    properties, 
    users, 
    createWalkInBorrowing, 
    isOnline, 
    openQrModal 
  } = useApp();

  const [selectedPropertyId, setSelectedPropertyId] = useState(initialProperty?.id || (properties.find(p => p.status === 'AVAILABLE')?.id || ''));
  const [selectedStudentId, setSelectedStudentId] = useState<string>('custom');
  const [studentName, setStudentName] = useState('');
  const [studentDept, setStudentDept] = useState('College of Engineering');
  const [studentPhone, setStudentPhone] = useState('');
  const [purpose, setPurpose] = useState('');
  const [condition, setCondition] = useState<PropertyCondition>('GOOD');
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 6);
    return d.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ transaction: any; isConflict: boolean } | null>(null);

  const studentUsers = users.filter(u => u.role === 'STUDENT');

  const handleStudentSelect = (val: string) => {
    setSelectedStudentId(val);
    if (val !== 'custom') {
      const u = studentUsers.find(user => user.id === val);
      if (u) {
        setStudentName(u.name);
        setStudentDept(u.department);
        setStudentPhone(u.phone || '');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !studentName.trim() || !purpose.trim()) return;

    setIsSubmitting(true);
    try {
      const res = createWalkInBorrowing({
        propertyId: selectedPropertyId,
        borrower: {
          id: selectedStudentId !== 'custom' ? selectedStudentId : undefined,
          name: studentName.trim(),
          department: studentDept.trim(),
          phone: studentPhone.trim()
        },
        purpose: purpose.trim(),
        expectedReturnDate: new Date(expectedReturnDate).toISOString(),
        condition,
        notes: notes.trim() || undefined
      });

      setCreatedResult(res);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error creating walk-in borrowing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                Urgent Walk-In & Immediate Borrowing
              </h3>
              <div className="text-[11px] text-slate-500">
                Direct On-the-Spot Physical Release
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {createdResult ? (
          <div className="p-6 text-center space-y-4">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${
              createdResult.isConflict ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {createdResult.isConflict ? <AlertCircle className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
            </div>

            <div>
              <h4 className="font-bold text-slate-900 text-base">
                {createdResult.isConflict ? 'Transaction Recorded with Conflict Warning' : 'Equipment Released Successfully'}
              </h4>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                Transaction ID: <span className="font-mono font-bold">{createdResult.transaction.id}</span>
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Equipment:</span>
                <span className="font-semibold">{createdResult.transaction.propertyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span>{createdResult.transaction.borrowerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Expected Return:</span>
                <span className="font-mono">{new Date(createdResult.transaction.expectedReturnDate).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-mono font-semibold">{createdResult.transaction.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openQrModal(createdResult.transaction.qrPayload, createdResult.transaction.id, createdResult.transaction.propertyName)}
                className="flex-1 py-2 px-3 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <QrCode className="w-4 h-4" />
                Show Claim QR
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Offline Status Banner (Section 11 Spec requirement) */}
            {!isOnline && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1 text-xs text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <WifiOff className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Custodian Device is Offline</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  <em>"Inventory availability reflects the last synchronization."</em> The transaction will be assigned status <strong>OFFLINE_APPROVED</strong> and queued locally.
                </p>
              </div>
            )}

            {/* Select Property */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Select Equipment to Release:
              </label>
              <select
                required
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.name} [{p.status} · {p.condition}]
                  </option>
                ))}
              </select>
            </div>

            {/* Borrower Selection / Input */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Borrower / Student:
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 mb-2"
                >
                  <option value="custom">+ Enter Student Details Manually</option>
                  {studentUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.department} ({u.studentId || 'No ID'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Full Student Name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Student Organization / Dept"
                    value={studentDept}
                    onChange={(e) => setStudentDept(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Immediate Purpose & Room:
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Emergency sound setup for Room 304 seminar"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Expected Return Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1">
                Expected Return Date & Time:
              </label>
              <input
                type="datetime-local"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>

            {/* Physical condition upon release */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Release Condition:
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as PropertyCondition)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                >
                  <option value="GOOD">GOOD</option>
                  <option value="MINOR_DAMAGE">MINOR_DAMAGE</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-900 mb-1">
                  Release Handover Note:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handed 1x power adapter"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
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
                disabled={isSubmitting || !studentName.trim() || !purpose.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
              >
                {isSubmitting ? 'Recording...' : (isOnline ? 'Approve & Release Instantly' : 'Offline Approve & Queue')}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
