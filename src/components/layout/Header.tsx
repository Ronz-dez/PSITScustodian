import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  QrCode, 
  RefreshCw, 
  User as UserIcon, 
  Layers, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentUser, 
    users, 
    setCurrentUser, 
    isOnline, 
    toggleNetworkSimulation, 
    syncPendingCount,
    syncConflictCount,
    pendingRequestsCount,
    pendingReturnsReviewCount,
    openScanner
  } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = users.find(u => u.id === e.target.value);
    if (selected) {
      setCurrentUser(selected);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'CUSTODIAN':
        return 'Property Custodian';
      case 'ORG_ADMIN':
        return 'Organization Admin';
      case 'SYSTEM_ADMIN':
        return 'System Admin';
      case 'STUDENT':
      default:
        return 'Student / Borrower';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Offline Alert Strip if offline */}
      {!isOnline && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1.5 text-xs font-medium flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>
              <strong>Campus Offline Mode Active:</strong> Field transactions (walk-in borrowings, return assessments, and QR scans) will be recorded locally and queued for synchronization.
            </span>
          </div>
          {syncPendingCount > 0 && (
            <button
              onClick={() => setCurrentTab('sync')}
              className="text-[11px] bg-amber-900/20 hover:bg-amber-900/30 px-2 py-0.5 rounded font-mono underline"
            >
              {syncPendingCount} queued action(s)
            </button>
          )}
        </div>
      )}

      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-xs">
              P
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base leading-tight tracking-tight whitespace-nowrap">
                Student Property Custody
              </div>
              <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Autonomous Custodian & Self-Assessment Hub
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'catalog' 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Equipment Catalog
            </button>

            <button
              onClick={() => setCurrentTab('borrowings')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap relative ${
                currentTab === 'borrowings' 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Borrowings & Requests
              {pendingRequestsCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-amber-100 text-amber-800 rounded font-bold">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('returns')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap relative ${
                currentTab === 'returns' 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Return Self-Assessment
              {pendingReturnsReviewCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] font-mono bg-blue-100 text-blue-800 rounded font-bold">
                  {pendingReturnsReviewCount}
                </span>
              )}
            </button>

            {(currentUser.role === 'CUSTODIAN' || currentUser.role === 'ORG_ADMIN' || currentUser.role === 'SYSTEM_ADMIN') && (
              <button
                onClick={() => setCurrentTab('custodian-mgmt')}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  currentTab === 'custodian-mgmt' 
                    ? 'bg-slate-100 text-slate-900 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Custodian Desk
              </button>
            )}

            <button
              onClick={() => setCurrentTab('reports')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                currentTab === 'reports' 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Reports & Audits
            </button>

            <button
              onClick={() => setCurrentTab('sync')}
              className={`px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap relative ${
                currentTab === 'sync' 
                  ? 'bg-slate-100 text-slate-900 font-semibold' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Sync & Offline
              {(syncPendingCount > 0 || syncConflictCount > 0) && (
                <span className={`ml-1.5 px-1.5 py-0.2 text-[10px] font-mono rounded font-bold ${
                  syncConflictCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                }`}>
                  {syncConflictCount > 0 ? `! ${syncConflictCount}` : syncPendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Live Camera Scanner Button */}
            <button
              onClick={() => openScanner()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
              title="Scan Asset QR Code or Transaction QR"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>

            {/* Offline Simulation Toggle Switch */}
            <button
              onClick={toggleNetworkSimulation}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200 font-semibold'
              }`}
              title="Toggle campus internet connectivity simulation"
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-700" />}
              <span className="font-mono text-[11px]">{isOnline ? 'Online' : 'Offline'}</span>
            </button>

            {/* User Role Switcher Dropdown */}
            <div className="relative flex items-center">
              <select
                value={currentUser.id}
                onChange={handleRoleChange}
                className="text-xs bg-slate-900 text-white pl-2.5 pr-7 py-1.5 rounded-lg appearance-none font-medium cursor-pointer hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({getRoleBadge(u.role)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300 absolute right-2 pointer-events-none" />
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {[
            { id: 'catalog', label: 'Catalog' },
            { id: 'borrowings', label: 'Borrowings' },
            { id: 'returns', label: 'Self-Return' },
            { id: 'custodian-mgmt', label: 'Custodian' },
            { id: 'reports', label: 'Reports' },
            { id: 'sync', label: 'Sync' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap ${
                currentTab === tab.id 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
