import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { PropertyCatalog } from './components/catalog/PropertyCatalog';
import { BorrowingsList } from './components/borrower/BorrowingsList';
import { ReturnReviewsView } from './components/returns/ReturnReviewsView';
import { CustodianDesk } from './components/custodian/CustodianDesk';
import { ReportsView } from './components/reports/ReportsView';
import { SyncCenter } from './components/sync/SyncCenter';
import { QRScannerModal } from './components/qr/QRScannerModal';
import { QRGeneratorModal } from './components/qr/QRGeneratorModal';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('catalog');
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'catalog' && <PropertyCatalog />}
        {currentTab === 'borrowings' && <BorrowingsList />}
        {currentTab === 'returns' && <ReturnReviewsView />}
        {currentTab === 'custodian-mgmt' && <CustodianDesk />}
        {currentTab === 'reports' && <ReportsView />}
        {currentTab === 'sync' && <SyncCenter />}
      </main>

      {/* Global QR Modals */}
      <QRScannerModal />
      <QRGeneratorModal />

      {/* Clean, minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Student Organization Property Management System</span>
            <span aria-hidden="true">·</span>
            <span>Department Custody & Self-Assessment Hub</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Logged in as: <strong className="text-slate-700">{currentUser.name}</strong> ({currentUser.role})</span>
            <span aria-hidden="true">·</span>
            <span>Offline Tolerant PWA Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
