import React, { useState } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Database, 
  ArrowRight,
  ShieldAlert,
  Trash2,
  Layers,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SyncQueueItem } from '../../types';

export const SyncCenter: React.FC = () => {
  const { 
    isOnline, 
    toggleNetworkSimulation, 
    lastSyncedAt, 
    syncQueue, 
    resolveConflict, 
    forceSyncAll, 
    resetAllData 
  } = useApp();

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [selectedConflict, setSelectedConflict] = useState<SyncQueueItem | null>(null);

  const pendingItems = syncQueue.filter(i => i.status === 'PENDING');
  const conflictItems = syncQueue.filter(i => i.status === 'CONFLICT');
  const syncedItems = syncQueue.filter(i => i.status === 'SYNCED');

  const handleSyncNow = () => {
    const res = forceSyncAll();
    setSyncFeedback(`Reconciled ${res.syncedCount} offline transaction(s). ${res.conflictCount} conflict(s) remaining.`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleResolveConflict = (itemId: string, resolution: 'FORCE_CONFIRM' | 'CANCEL_TRANSACTION') => {
    resolveConflict(itemId, resolution);
    setSelectedConflict(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Offline-First Synchronization & Conflict Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            IndexedDB local persistence queue, connectivity status simulation, and server reconciliation engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleNetworkSimulation}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
            }`}
          >
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-600" /> : <WifiOff className="w-4 h-4 text-amber-700" />}
            <span>Simulate {isOnline ? 'Offline Drop' : 'Online Reconnection'}</span>
          </button>

          <button
            onClick={handleSyncNow}
            disabled={!isOnline}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Force Sync Queue
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Connectivity & Architecture Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-slate-900 text-sm">Offline Architecture Status</h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Last Synced: {new Date(lastSyncedAt).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-400 text-[11px]">Current Network State:</div>
            <div className="flex items-center gap-1.5 mt-1 font-bold text-sm">
              {isOnline ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <Wifi className="w-4 h-4" /> Central Server Connected
                </span>
              ) : (
                <span className="text-amber-800 flex items-center gap-1">
                  <WifiOff className="w-4 h-4" /> Disconnected (Local IndexedDB Cache Active)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Field operations like QR scans, photo return assessments, and walk-in borrowings execute with zero latency.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-400 text-[11px]">Pending Sync Items:</div>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">{pendingItems.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Transactions, return assessments, and logs queued to sync upon reconnect.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-slate-400 text-[11px]">Conflict Discrepancies:</div>
            <div className={`text-xl font-bold font-mono mt-1 ${conflictItems.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {conflictItems.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Double-bookings or state collisions requiring custodian reconciliation.
            </p>
          </div>
        </div>
      </div>

      {/* Sync Conflicts Section */}
      {conflictItems.length > 0 && (
        <div className="bg-rose-50/50 border border-rose-300 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-rose-950">
            <ShieldAlert className="w-5 h-5 text-rose-700" />
            <h2 className="font-bold text-sm">Synchronization Conflicts Requiring Custodian Resolution</h2>
          </div>

          <div className="space-y-3">
            {conflictItems.map(item => (
              <div key={item.id} className="p-4 bg-white border border-rose-200 rounded-lg text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-rose-900">
                    Conflict ID: {item.id} ({item.entityType})
                  </span>
                  <span className="text-rose-700 font-semibold">{item.conflictDetails?.conflictType}</span>
                </div>

                <p className="text-slate-700">
                  {item.conflictDetails?.message || 'Property availability mismatch occurred while custodian was offline.'}
                </p>

                <div className="flex justify-end gap-2 pt-2 border-t border-rose-100">
                  <button
                    onClick={() => handleResolveConflict(item.id, 'CANCEL_TRANSACTION')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    Cancel Offline Loan & Return Item
                  </button>
                  <button
                    onClick={() => handleResolveConflict(item.id, 'FORCE_CONFIRM')}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-900 hover:bg-rose-800 rounded"
                  >
                    Force Authorize Loan (Override Server)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h2 className="font-bold text-slate-900 text-sm">Local Queue Transaction Feed ({syncQueue.length})</h2>
          </div>
        </div>

        {syncQueue.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
            The offline synchronization queue is empty. All local events are synced with the central repository.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-sans">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Queue ID</th>
                  <th className="px-4 py-2.5 font-semibold">Entity Type</th>
                  <th className="px-4 py-2.5 font-semibold">Action</th>
                  <th className="px-4 py-2.5 font-semibold">Enqueued At</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {syncQueue.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.id}</td>
                    <td className="px-4 py-3 text-slate-700">{item.entityType}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{item.action}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(item.createdAt).toLocaleTimeString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        item.status === 'SYNCED'
                          ? 'bg-emerald-100 text-emerald-900'
                          : (item.status === 'CONFLICT' ? 'bg-rose-100 text-rose-900 font-bold' : 'bg-amber-100 text-amber-900')
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Reset & Data Maintenance */}
      <div className="bg-slate-100 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-xs">Reset Application Database</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Restores initial department equipment, sample active loans, return self-assessments, and audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset all data to initial demonstration state?')) {
              resetAllData();
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Demo Data
        </button>
      </div>

    </div>
  );
};
