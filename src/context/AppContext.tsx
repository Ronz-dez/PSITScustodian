import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../services/db';
import {
  User,
  UserRole,
  Property,
  PropertyCategory,
  StorageLocation,
  PropertyRequest,
  BorrowTransaction,
  ReturnAssessment,
  CustodianReview,
  DamageReport,
  AuditLogEntry,
  SyncQueueItem,
  SystemSettings,
  PropertyCondition
} from '../types';

interface AppContextType {
  currentUser: User;
  users: User[];
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  isOnline: boolean;
  toggleNetworkSimulation: () => void;
  lastSyncedAt: string;
  
  properties: Property[];
  categories: PropertyCategory[];
  locations: StorageLocation[];
  requests: PropertyRequest[];
  transactions: BorrowTransaction[];
  returnAssessments: ReturnAssessment[];
  custodianReviews: CustodianReview[];
  damageReports: DamageReport[];
  auditLogs: AuditLogEntry[];
  syncQueue: SyncQueueItem[];
  settings: SystemSettings;

  // Stats & derived
  pendingRequestsCount: number;
  activeBorrowingsCount: number;
  overdueCount: number;
  pendingReturnsReviewCount: number;
  syncPendingCount: number;
  syncConflictCount: number;

  // Actions
  createRequest: (data: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => PropertyRequest;
  reviewRequest: (requestId: string, action: 'APPROVE' | 'REJECT' | 'REVISION_REQUIRED', notes?: string) => void;
  releaseApprovedRequest: (requestId: string, condition?: PropertyCondition, notes?: string) => BorrowTransaction | null;
  createWalkInBorrowing: (params: {
    propertyId: string;
    borrower: { id?: string; name: string; email?: string; department: string; phone?: string };
    purpose: string;
    expectedReturnDate: string;
    condition?: PropertyCondition;
    notes?: string;
  }) => { transaction: BorrowTransaction; isConflict: boolean };
  submitReturnAssessment: (data: {
    borrowTransactionId: string;
    propertyId: string;
    borrowerId: string;
    borrowerName: string;
    conditionDeclared: PropertyCondition;
    descriptionNotes: string;
    photoEvidence: string[];
    accessoriesIncluded: boolean;
    declarationAccepted: boolean;
  }) => ReturnAssessment;
  reviewReturnAssessment: (params: {
    returnAssessmentId: string;
    borrowTransactionId: string;
    decision: 'ACCEPT' | 'OVERRIDE';
    finalCondition: PropertyCondition;
    overrideReason?: string;
    conditionNotes?: string;
    maintenanceRecommended?: boolean;
  }) => CustodianReview | null;
  saveProperty: (prop: Property) => void;
  resolveConflict: (queueItemId: string, resolution: 'FORCE_CONFIRM' | 'CANCEL_TRANSACTION') => void;
  forceSyncAll: () => { syncedCount: number; conflictCount: number };
  resetAllData: () => void;

  // Global UI modal triggers
  activeScanModal: { isOpen: boolean; defaultCode?: string; onScan?: (code: string) => void };
  openScanner: (onScan?: (code: string) => void) => void;
  closeScanner: () => void;
  activeQrModal: { isOpen: boolean; payload?: string; title?: string; subtitle?: string };
  openQrModal: (payload: string, title?: string, subtitle?: string) => void;
  closeQrModal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(() => db.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [isOnline, setIsOnline] = useState<boolean>(() => db.isOnline());
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(() => db.getLastSyncedAt());

  const [properties, setProperties] = useState<Property[]>(() => db.getProperties());
  const [categories, setCategories] = useState<PropertyCategory[]>(() => db.getCategories());
  const [locations, setLocations] = useState<StorageLocation[]>(() => db.getLocations());
  const [requests, setRequests] = useState<PropertyRequest[]>(() => db.getRequests());
  const [transactions, setTransactions] = useState<BorrowTransaction[]>(() => db.getTransactions());
  const [returnAssessments, setReturnAssessments] = useState<ReturnAssessment[]>(() => db.getReturnAssessments());
  const [custodianReviews, setCustodianReviews] = useState<CustodianReview[]>(() => db.getCustodianReviews());
  const [damageReports, setDamageReports] = useState<DamageReport[]>(() => db.getDamageReports());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => db.getAuditLogs());
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>(() => db.getSyncQueue());
  const [settings, setSettings] = useState<SystemSettings>(() => db.getSettings());

  // Modal states
  const [activeScanModal, setActiveScanModal] = useState<{ isOpen: boolean; onScan?: (code: string) => void }>({ isOpen: false });
  const [activeQrModal, setActiveQrModal] = useState<{ isOpen: boolean; payload?: string; title?: string; subtitle?: string }>({ isOpen: false });

  const refreshState = useCallback(() => {
    setCurrentUserState(db.getCurrentUser());
    setUsers(db.getUsers());
    setIsOnline(db.isOnline());
    setLastSyncedAt(db.getLastSyncedAt());
    setProperties(db.getProperties());
    setCategories(db.getCategories());
    setLocations(db.getLocations());
    setRequests(db.getRequests());
    setTransactions(db.getTransactions());
    setReturnAssessments(db.getReturnAssessments());
    setCustodianReviews(db.getCustodianReviews());
    setDamageReports(db.getDamageReports());
    setAuditLogs(db.getAuditLogs());
    setSyncQueue(db.getSyncQueue());
    setSettings(db.getSettings());
  }, []);

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      refreshState();
    });
    return unsubscribe;
  }, [refreshState]);

  const setCurrentUser = (user: User) => {
    db.setCurrentUser(user.id);
    setCurrentUserState(user);
  };

  const switchRole = (role: UserRole) => {
    const allUsers = db.getUsers();
    const targetUser = allUsers.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const toggleNetworkSimulation = () => {
    db.toggleNetworkSimulation();
    setIsOnline(db.isOnline());
  };

  const createRequest = (data: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
    const req = db.createRequest(data);
    refreshState();
    return req;
  };

  const reviewRequest = (requestId: string, action: 'APPROVE' | 'REJECT' | 'REVISION_REQUIRED', notes?: string) => {
    db.reviewRequest(requestId, action, currentUser, notes);
    refreshState();
  };

  const releaseApprovedRequest = (requestId: string, condition?: PropertyCondition, notes?: string) => {
    const tx = db.releaseApprovedRequest(requestId, currentUser, condition, notes);
    refreshState();
    return tx;
  };

  const createWalkInBorrowing = (params: {
    propertyId: string;
    borrower: { id?: string; name: string; email?: string; department: string; phone?: string };
    purpose: string;
    expectedReturnDate: string;
    condition?: PropertyCondition;
    notes?: string;
  }) => {
    const result = db.createWalkInBorrowing({ ...params, custodian: currentUser });
    refreshState();
    return result;
  };

  const submitReturnAssessment = (data: {
    borrowTransactionId: string;
    propertyId: string;
    borrowerId: string;
    borrowerName: string;
    conditionDeclared: PropertyCondition;
    descriptionNotes: string;
    photoEvidence: string[];
    accessoriesIncluded: boolean;
    declarationAccepted: boolean;
  }) => {
    const assessment = db.submitReturnAssessment(data);
    refreshState();
    return assessment;
  };

  const reviewReturnAssessment = (params: {
    returnAssessmentId: string;
    borrowTransactionId: string;
    decision: 'ACCEPT' | 'OVERRIDE';
    finalCondition: PropertyCondition;
    overrideReason?: string;
    conditionNotes?: string;
    maintenanceRecommended?: boolean;
  }) => {
    const rev = db.reviewReturnAssessment({ ...params, custodian: currentUser });
    refreshState();
    return rev;
  };

  const saveProperty = (prop: Property) => {
    db.saveProperty(prop);
    refreshState();
  };

  const resolveConflict = (queueItemId: string, resolution: 'FORCE_CONFIRM' | 'CANCEL_TRANSACTION') => {
    db.resolveSyncConflict(queueItemId, resolution);
    refreshState();
  };

  const forceSyncAll = () => {
    const res = db.forceSyncAll();
    refreshState();
    return res;
  };

  const resetAllData = () => {
    db.resetAllData();
    refreshState();
  };

  const openScanner = (onScan?: (code: string) => void) => {
    setActiveScanModal({ isOpen: true, onScan });
  };

  const closeScanner = () => {
    setActiveScanModal({ isOpen: false });
  };

  const openQrModal = (payload: string, title?: string, subtitle?: string) => {
    setActiveQrModal({ isOpen: true, payload, title, subtitle });
  };

  const closeQrModal = () => {
    setActiveQrModal({ isOpen: false });
  };

  // Derived counts
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const activeBorrowingsCount = transactions.filter(t => t.status === 'BORROWED' || t.status === 'OFFLINE_APPROVED').length;
  
  const nowTime = new Date().getTime();
  const overdueCount = transactions.filter(t => {
    if (t.status !== 'BORROWED' && t.status !== 'OFFLINE_APPROVED') return false;
    return new Date(t.expectedReturnDate).getTime() < nowTime;
  }).length;

  const pendingReturnsReviewCount = transactions.filter(t => t.status === 'RETURN_PENDING_REVIEW').length;
  const syncPendingCount = syncQueue.filter(s => s.status === 'PENDING').length;
  const syncConflictCount = syncQueue.filter(s => s.status === 'CONFLICT').length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser,
        switchRole,
        isOnline,
        toggleNetworkSimulation,
        lastSyncedAt,
        properties,
        categories,
        locations,
        requests,
        transactions,
        returnAssessments,
        custodianReviews,
        damageReports,
        auditLogs,
        syncQueue,
        settings,
        pendingRequestsCount,
        activeBorrowingsCount,
        overdueCount,
        pendingReturnsReviewCount,
        syncPendingCount,
        syncConflictCount,
        createRequest,
        reviewRequest,
        releaseApprovedRequest,
        createWalkInBorrowing,
        submitReturnAssessment,
        reviewReturnAssessment,
        saveProperty,
        resolveConflict,
        forceSyncAll,
        resetAllData,
        activeScanModal,
        openScanner,
        closeScanner,
        activeQrModal,
        openQrModal,
        closeQrModal
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
