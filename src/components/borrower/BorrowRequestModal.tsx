import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, CheckCircle2, User, Phone, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';

interface BorrowRequestModalProps {
  property: Property | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BorrowRequestModal: React.FC<BorrowRequestModalProps> = ({
  property,
  onClose,
  onSuccess
}) => {
  const { currentUser, createRequest, isOnline } = useApp();

  const [eventTitle, setEventTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [borrowDate, setBorrowDate] = useState(() => {
    const d = new Date();
    d.setMinutes(0);
    d.setSeconds(0);
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [expectedReturnDate, setExpectedReturnDate] = useState(() => {
    const d = new Date();
    d.setMinutes(0);
    d.setSeconds(0);
    d.setHours(d.getHours() + 9);
    return d.toISOString().slice(0, 16);
  });
  const [responsiblePerson, setResponsiblePerson] = useState(currentUser.name);
  const [contactNumber, setContactNumber] = useState(currentUser.phone || '');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  if (!property) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) return;

    setIsSubmitting(true);

    try {
      const newReq = createRequest({
        propertyId: property.id,
        borrowerId: currentUser.id,
        borrowerName: currentUser.name,
        borrowerDepartment: currentUser.department,
        eventTitle: eventTitle.trim() || undefined,
        purpose: purpose.trim(),
        borrowDate: new Date(borrowDate).toISOString(),
        expectedReturnDate: new Date(expectedReturnDate).toISOString(),
        responsiblePerson: responsiblePerson.trim() || currentUser.name,
        contactNumber: contactNumber.trim() || '+63 900 000 0000',
        remarks: remarks.trim() || undefined
      });

      setSubmittedRequest(newReq);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error submitting request:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {submittedRequest ? 'Borrowing Request Submitted' : 'Submit Property Borrowing Request'}
            </h3>
            <div className="text-xs text-slate-500">
              {property.name} ({property.id})
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body or Success confirmation */}
        {submittedRequest ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-base">Request Pending Custodian Review</h4>
              <div className="text-xs text-slate-500 mt-1">
                Tracking ID: <span className="font-mono font-bold text-slate-800">{submittedRequest.id}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1.5 text-slate-600">
              <div><strong>Property:</strong> {property.name} ({property.id})</div>
              <div><strong>Borrower:</strong> {currentUser.name} ({currentUser.department})</div>
              <div><strong>Schedule:</strong> {new Date(borrowDate).toLocaleString()} ➔ {new Date(expectedReturnDate).toLocaleString()}</div>
              <div><strong>Status:</strong> {isOnline ? 'Transmitted to Custodian for Remote Approval' : 'Queued Locally (Offline Sync Pending)'}</div>
            </div>

            <p className="text-xs text-slate-500">
              The property custodian will review this request remotely. You will be able to claim the equipment once approved.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Property summary banner */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="w-12 h-12 rounded bg-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                {property.photoUrl ? (
                  <img src={property.photoUrl} alt={property.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-xs font-bold text-slate-600">{property.id}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-900 truncate">{property.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                  <span>ID: {property.id}</span>
                  <span>·</span>
                  <span>Condition: {property.condition}</span>
                </div>
              </div>
            </div>

            {/* Offline notice if applicable */}
            {!isOnline && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Offline Mode:</strong> Request will be stored on this device and synced when campus connectivity is restored.
                </span>
              </div>
            )}

            {/* Event Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event / Project Title:
              </label>
              <input
                type="text"
                placeholder="e.g. Annual General Assembly or Tech Workshop"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Purpose & Venue <span className="text-rose-500">*</span>:
              </label>
              <textarea
                required
                rows={2}
                placeholder="Explain the specific organization use, expected audience, and venue room..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Date & Time Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Required Borrow Date & Time:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
            </div>

            {/* Responsible Person & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Responsible Officer / Borrower:
                </label>
                <input
                  type="text"
                  required
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Phone / Mobile Number:
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+63 9XX XXX XXXX"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Remarks / Accessories needed */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Additional Remarks / Cables / Accessories Needed:
              </label>
              <input
                type="text"
                placeholder="e.g. Requesting extra XLR cable or heavy-duty extension cord"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
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
                disabled={isSubmitting || !purpose.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
