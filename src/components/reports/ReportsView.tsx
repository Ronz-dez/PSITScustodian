import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  ShieldAlert, 
  Layers,
  ArrowRight,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLogEntry, PropertyCondition } from '../../types';

export const ReportsView: React.FC = () => {
  const { 
    properties, 
    categories, 
    transactions, 
    requests, 
    returnAssessments, 
    custodianReviews, 
    damageReports, 
    auditLogs 
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'INVENTORY' | 'OVERDUE' | 'OVERRIDES' | 'DAMAGE' | 'AUDIT_LOGS'>('INVENTORY');
  const [auditFilter, setAuditFilter] = useState('');

  // Computations
  const totalAssets = properties.length;
  const availableCount = properties.filter(p => p.status === 'AVAILABLE').length;
  const borrowedCount = properties.filter(p => p.status === 'BORROWED').length;
  const maintenanceCount = properties.filter(p => p.status === 'MAINTENANCE').length;
  const utilizationRate = totalAssets > 0 ? Math.round((borrowedCount / totalAssets) * 100) : 0;

  const nowTime = new Date().getTime();
  const overdueTransactions = transactions.filter(t => {
    if (t.status !== 'BORROWED' && t.status !== 'OFFLINE_APPROVED') return false;
    return new Date(t.expectedReturnDate).getTime() < nowTime;
  });

  const overrideReviews = custodianReviews.filter(r => r.decision === 'OVERRIDE');

  const filteredAuditLogs = auditLogs.filter(log => {
    const q = auditFilter.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = (filename: string, rows: string[][], headers: string[]) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Administrative Reports & Custody Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department property metrics, student self-assessment override analysis, and immutable security records.
          </p>
        </div>

        <div className="flex items-center gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          
          <button
            onClick={() => {
              if (activeReportTab === 'INVENTORY') {
                handleExportCSV('SOPMS_Inventory_Report', properties.map(p => [p.id, p.name, p.status, p.condition, String(p.totalBorrowCount)]), ['Asset ID', 'Name', 'Status', 'Condition', 'Total Borrow Count']);
              } else if (activeReportTab === 'AUDIT_LOGS') {
                handleExportCSV('SOPMS_Audit_Log', auditLogs.map(l => [l.timestamp, l.userName, l.userRole, l.action, l.entityId, l.details]), ['Timestamp', 'User', 'Role', 'Action', 'Entity ID', 'Details']);
              } else if (activeReportTab === 'OVERRIDES') {
                handleExportCSV('SOPMS_Override_Report', overrideReviews.map(r => [r.id, r.returnAssessmentId, r.originalStudentCondition, r.finalCondition, r.overrideReason || '', r.custodianName]), ['Review ID', 'Assessment ID', 'Student Declared', 'Custodian Final', 'Reason', 'Custodian']);
              } else {
                handleExportCSV('SOPMS_Overdue_Report', overdueTransactions.map(o => [o.id, o.propertyCode, o.borrowerName, o.expectedReturnDate]), ['Transaction ID', 'Asset', 'Borrower', 'Expected Return']);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Overview Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Asset Utilization</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{utilizationRate}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{borrowedCount} of {totalAssets} assets in active field use</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Self-Return Overrides</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{overrideReviews.length}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Custodian condition corrections</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Active Overdue Loans</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${overdueTransactions.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {overdueTransactions.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Immediate follow-up required</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500">Audit Trail Entries</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{auditLogs.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Cryptographically logged actions</div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 overflow-x-auto no-print">
        {[
          { id: 'INVENTORY', label: 'Inventory & Stock Breakdown' },
          { id: 'OVERDUE', label: `Overdue Items (${overdueTransactions.length})` },
          { id: 'OVERRIDES', label: `Student Override Analysis (${overrideReviews.length})` },
          { id: 'DAMAGE', label: `Damage & Incident Log (${damageReports.length})` },
          { id: 'AUDIT_LOGS', label: `Full Audit Log (${auditLogs.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeReportTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Current Inventory Report */}
      {activeReportTab === 'INVENTORY' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Current Department Asset Inventory Registry</h2>
            <span className="text-xs text-slate-500 font-mono">Total Units: {properties.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Asset ID</th>
                  <th className="px-4 py-2.5 font-semibold">Equipment Name</th>
                  <th className="px-4 py-2.5 font-semibold">Category</th>
                  <th className="px-4 py-2.5 font-semibold">Current Status</th>
                  <th className="px-4 py-2.5 font-semibold">Condition</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Lifetime Loans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map(prop => (
                  <tr key={prop.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{prop.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{prop.name}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {categories.find(c => c.id === prop.categoryId)?.name || 'General'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        prop.status === 'AVAILABLE' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : (prop.status === 'BORROWED' ? 'bg-amber-100 text-amber-900' : 'bg-slate-200 text-slate-800')
                      }`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium">{prop.condition}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{prop.totalBorrowCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Overdue Items Report */}
      {activeReportTab === 'OVERDUE' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Overdue Property Loans (Immediate Resolution)</h2>
            <span className="text-xs text-rose-600 font-bold">{overdueTransactions.length} items overdue</span>
          </div>

          {overdueTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              All borrowed properties are within their valid loan periods.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Transaction ID</th>
                    <th className="px-4 py-2.5 font-semibold">Equipment</th>
                    <th className="px-4 py-2.5 font-semibold">Borrower Name</th>
                    <th className="px-4 py-2.5 font-semibold">Department</th>
                    <th className="px-4 py-2.5 font-semibold">Expected Return</th>
                    <th className="px-4 py-2.5 font-semibold">Contact Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-rose-50/30">
                      <td className="px-4 py-3 font-mono font-bold text-rose-900">{tx.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{tx.propertyName} ({tx.propertyCode})</td>
                      <td className="px-4 py-3 text-slate-800 font-semibold">{tx.borrowerName}</td>
                      <td className="px-4 py-3 text-slate-500">{tx.borrowerDepartment}</td>
                      <td className="px-4 py-3 font-mono text-rose-700 font-bold">
                        {new Date(tx.expectedReturnDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{tx.borrowerEmail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Return Assessment Override Analysis */}
      {activeReportTab === 'OVERRIDES' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Student Self-Assessment Override Analysis</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identifies instances where custodian inspection differed from student condition self-declaration.
            </p>
          </div>

          {overrideReviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
              No return self-assessment overrides recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {overrideReviews.map(rev => {
                const assessment = returnAssessments.find(a => a.id === rev.returnAssessmentId);
                const tx = transactions.find(t => t.id === rev.borrowTransactionId);

                return (
                  <div key={rev.id} className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-2 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{rev.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-800">{tx?.propertyName || rev.propertyId}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700">
                          Student Declared: {rev.originalStudentCondition}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-rose-600" />
                        <span className="px-2 py-0.5 bg-rose-900 text-white rounded font-bold">
                          Custodian Final: {rev.finalCondition}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white rounded-lg border border-rose-100 text-slate-700">
                      <div>
                        <div><strong>Borrower:</strong> {tx?.borrowerName || 'Student'} ({tx?.borrowerDepartment || 'N/A'})</div>
                        <div><strong>Student Notes:</strong> {assessment?.descriptionNotes || 'None'}</div>
                        <div><strong>Evidence:</strong> {assessment?.photoEvidence.length || 0} photo(s) submitted</div>
                      </div>
                      <div className="border-t sm:border-t-0 sm:border-l sm:pl-3 border-slate-100">
                        <div><strong>Reviewing Custodian:</strong> {rev.custodianName}</div>
                        <div><strong>Override Reason:</strong> <span className="text-rose-950 font-semibold">{rev.overrideReason}</span></div>
                        <div><strong>Timestamp:</strong> {new Date(rev.reviewedAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Damage & Incident Reports */}
      {activeReportTab === 'DAMAGE' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Equipment Damage & Missing Item Records</h2>
            <span className="text-xs text-slate-500 font-mono">{damageReports.length} Incident(s)</span>
          </div>

          {damageReports.length === 0 ? (
            <div className="py-8 text-center text-xs text-emerald-700 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
              No damage or loss incidents reported across the inventory.
            </div>
          ) : (
            <div className="space-y-3">
              {damageReports.map(rep => (
                <div key={rep.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900">{rep.id} · Asset: {rep.propertyId}</span>
                    <span className="font-semibold text-rose-700">{rep.severity} SEVERITY</span>
                  </div>
                  <p className="text-slate-700">{rep.description}</p>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200">
                    <span>Reported by {rep.reportedBy} ({rep.reporterRole})</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Immutable Full Audit Log Explorer */}
      {activeReportTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Complete Chain of Custody Audit Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">Immutable record of every request, approval, release, self-return, and override.</p>
            </div>

            {/* Filter Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter logs by action, user, ID..."
                value={auditFilter}
                onChange={e => setAuditFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Timestamp</th>
                  <th className="px-4 py-2.5 font-semibold">User & Role</th>
                  <th className="px-4 py-2.5 font-semibold">Action</th>
                  <th className="px-4 py-2.5 font-semibold">Entity</th>
                  <th className="px-4 py-2.5 font-semibold">Event Details</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">{log.userName}</div>
                      <div className="text-[10px] text-slate-400">{log.userRole}</div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span className="font-bold text-slate-900">{log.action}</span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                      {log.entityType} · {log.entityId}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-700 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap text-[10px] text-slate-400">
                      {log.deviceContext}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
