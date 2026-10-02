/**
 * IndexedDB & Local Storage Persistence Layer for SOPMS
 */
import {
  Property,
  PropertyRequest,
  BorrowTransaction,
  ReturnAssessment,
  CustodianReview,
  DamageReport,
  AuditLogEntry,
  SyncQueueItem,
  User,
  SystemSettings,
  PropertyCategory,
  StorageLocation,
  UserRole,
  PropertyCondition
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_LOCATIONS,
  INITIAL_PROPERTIES,
  INITIAL_REQUESTS,
  INITIAL_TRANSACTIONS,
  INITIAL_RETURN_ASSESSMENTS,
  INITIAL_CUSTODIAN_REVIEWS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS
} from './mockData';

const DB_PREFIX = 'sopms_db_v1_';

export class SOPMSDatabase {
  private static instance: SOPMSDatabase;
  private listeners: Set<() => void> = new Set();
  public isSimulatedOffline: boolean = false;

  private constructor() {
    this.initializeIfEmpty();
    // Listen to real browser network status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (!this.isSimulatedOffline) this.notifyListeners();
      });
      window.addEventListener('offline', () => {
        this.notifyListeners();
      });
    }
  }

  public static getInstance(): SOPMSDatabase {
    if (!SOPMSDatabase.instance) {
      SOPMSDatabase.instance = new SOPMSDatabase();
    }
    return SOPMSDatabase.instance;
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach(cb => cb());
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(DB_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
      this.notifyListeners();
    } catch (e) {
      console.error('Storage quota exceeded or storage error:', e);
    }
  }

  public initializeIfEmpty(forceReset = false): void {
    if (forceReset || !localStorage.getItem(DB_PREFIX + 'initialized')) {
      this.setItem('users', INITIAL_USERS);
      this.setItem('categories', INITIAL_CATEGORIES);
      this.setItem('locations', INITIAL_LOCATIONS);
      this.setItem('properties', INITIAL_PROPERTIES);
      this.setItem('requests', INITIAL_REQUESTS);
      this.setItem('transactions', INITIAL_TRANSACTIONS);
      this.setItem('return_assessments', INITIAL_RETURN_ASSESSMENTS);
      this.setItem('custodian_reviews', INITIAL_CUSTODIAN_REVIEWS);
      this.setItem('damage_reports', []);
      this.setItem('audit_logs', INITIAL_AUDIT_LOGS);
      this.setItem('sync_queue', []);
      this.setItem('settings', INITIAL_SETTINGS);
      this.setItem('current_user_id', INITIAL_USERS[0].id);
      this.setItem('last_synced_at', new Date().toISOString());
      this.setItem('initialized', 'true');
    }
  }

  // Network simulation
  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public toggleNetworkSimulation(): boolean {
    this.isSimulatedOffline = !this.isSimulatedOffline;
    this.notifyListeners();
    return !this.isSimulatedOffline;
  }

  public setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    this.notifyListeners();
  }

  // Users
  public getUsers(): User[] {
    return this.getItem<User[]>('users', INITIAL_USERS);
  }

  public getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getItem<string>('current_user_id', users[0]?.id || 'user_student_1');
    return users.find(u => u.id === currentId) || users[0];
  }

  public setCurrentUser(userId: string): void {
    this.setItem('current_user_id', userId);
  }

  // Categories & Locations
  public getCategories(): PropertyCategory[] {
    return this.getItem<PropertyCategory[]>('categories', INITIAL_CATEGORIES);
  }

  public getLocations(): StorageLocation[] {
    return this.getItem<StorageLocation[]>('locations', INITIAL_LOCATIONS);
  }

  public getSettings(): SystemSettings {
    return this.getItem<SystemSettings>('settings', INITIAL_SETTINGS);
  }

  public updateSettings(settings: Partial<SystemSettings>): void {
    const current = this.getSettings();
    this.setItem('settings', { ...current, ...settings });
  }

  // Properties
  public getProperties(): Property[] {
    return this.getItem<Property[]>('properties', INITIAL_PROPERTIES);
  }

  public getPropertyById(id: string): Property | undefined {
    return this.getProperties().find(p => p.id === id || p.qrIdentifier === id);
  }

  public saveProperty(property: Property): void {
    const properties = this.getProperties();
    const index = properties.findIndex(p => p.id === property.id);
    if (index >= 0) {
      properties[index] = { ...property, updatedAt: new Date().toISOString() };
    } else {
      properties.push({ ...property, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    this.setItem('properties', properties);
  }

  // Requests
  public getRequests(): PropertyRequest[] {
    return this.getItem<PropertyRequest[]>('requests', INITIAL_REQUESTS);
  }

  public getRequestById(id: string): PropertyRequest | undefined {
    return this.getRequests().find(r => r.id === id);
  }

  public createRequest(data: Omit<PropertyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>): PropertyRequest {
    const requests = this.getRequests();
    const nextNum = requests.length + 82;
    const newRequest: PropertyRequest = {
      ...data,
      id: `REQ-2026-${String(nextNum).padStart(4, '0')}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    requests.unshift(newRequest);
    this.setItem('requests', requests);

    // Audit Log
    this.addAuditLog({
      userId: data.borrowerId,
      userName: data.borrowerName,
      userRole: 'STUDENT',
      action: 'SUBMIT_REQUEST',
      entityType: 'REQUEST',
      entityId: newRequest.id,
      details: `Submitted request for property ${data.propertyId} (${data.purpose})`
    });

    if (!this.isOnline()) {
      this.enqueueSyncItem({
        entityType: 'REQUEST',
        action: 'CREATE',
        payload: newRequest
      });
    }

    return newRequest;
  }

  public reviewRequest(
    requestId: string,
    action: 'APPROVE' | 'REJECT' | 'REVISION_REQUIRED',
    custodian: User,
    notes?: string
  ): PropertyRequest | null {
    const requests = this.getRequests();
    const index = requests.findIndex(r => r.id === requestId);
    if (index === -1) return null;

    const req = requests[index];
    const now = new Date().toISOString();
    
    if (action === 'APPROVE') {
      req.status = 'APPROVED';
      req.custodianNotes = notes;
      req.reviewedBy = custodian.id;
      req.reviewedAt = now;
      req.updatedAt = now;

      // Update property status to RESERVED if not already borrowed
      const property = this.getPropertyById(req.propertyId);
      if (property && property.status === 'AVAILABLE') {
        property.status = 'RESERVED';
        this.saveProperty(property);
      }

      this.addAuditLog({
        userId: custodian.id,
        userName: custodian.name,
        userRole: custodian.role,
        action: 'APPROVE_REQUEST',
        entityType: 'REQUEST',
        entityId: req.id,
        details: `Approved request ${req.id} for ${req.borrowerName}. Note: ${notes || 'None'}`
      });
    } else if (action === 'REJECT') {
      req.status = 'REJECTED';
      req.rejectionReason = notes || 'Request not approved by custodian.';
      req.reviewedBy = custodian.id;
      req.reviewedAt = now;
      req.updatedAt = now;

      this.addAuditLog({
        userId: custodian.id,
        userName: custodian.name,
        userRole: custodian.role,
        action: 'REJECT_REQUEST',
        entityType: 'REQUEST',
        entityId: req.id,
        details: `Rejected request ${req.id}. Reason: ${req.rejectionReason}`
      });
    } else if (action === 'REVISION_REQUIRED') {
      req.status = 'REVISION_REQUIRED';
      req.revisionNotes = notes || 'Please correct requested borrowing duration or purpose details.';
      req.reviewedBy = custodian.id;
      req.reviewedAt = now;
      req.updatedAt = now;

      this.addAuditLog({
        userId: custodian.id,
        userName: custodian.name,
        userRole: custodian.role,
        action: 'REVISE_REQUEST',
        entityType: 'REQUEST',
        entityId: req.id,
        details: `Requested revision for ${req.id}: ${req.revisionNotes}`
      });
    }

    requests[index] = req;
    this.setItem('requests', requests);
    return req;
  }

  // Transactions
  public getTransactions(): BorrowTransaction[] {
    return this.getItem<BorrowTransaction[]>('transactions', INITIAL_TRANSACTIONS);
  }

  public getTransactionById(id: string): BorrowTransaction | undefined {
    return this.getTransactions().find(t => t.id === id || t.qrPayload === id);
  }

  public releaseApprovedRequest(requestId: string, custodian: User, condition: PropertyCondition = 'GOOD', notes?: string): BorrowTransaction | null {
    const req = this.getRequestById(requestId);
    if (!req) return null;
    const property = this.getPropertyById(req.propertyId);
    if (!property) return null;

    const transactions = this.getTransactions();
    const nextNum = transactions.length + 143;
    const now = new Date().toISOString();
    const isOffline = !this.isOnline();

    const transaction: BorrowTransaction = {
      id: `BR-2026-${String(nextNum).padStart(4, '0')}`,
      requestId: req.id,
      propertyId: property.id,
      propertyCode: property.id,
      propertyName: property.name,
      borrowerId: req.borrowerId,
      borrowerName: req.borrowerName,
      borrowerEmail: `${req.borrowerName.toLowerCase().replace(/\s+/g, '.')}@student.univ.edu`,
      borrowerDepartment: req.borrowerDepartment,
      purpose: req.purpose,
      borrowDate: req.borrowDate,
      expectedReturnDate: req.expectedReturnDate,
      actualReleaseDate: now,
      releasedByCustodianId: custodian.id,
      releasedByCustodianName: custodian.name,
      releaseCondition: condition,
      releaseNotes: notes,
      status: isOffline ? 'SYNC_PENDING' : 'BORROWED',
      isWalkIn: false,
      isOfflineCreated: isOffline,
      qrPayload: `https://sopms.app/scan/borrow/BR-2026-${String(nextNum).padStart(4, '0')}`,
      createdAt: now,
      updatedAt: now
    };

    transactions.unshift(transaction);
    this.setItem('transactions', transactions);

    // Update Property
    property.status = 'BORROWED';
    property.currentBorrowingId = transaction.id;
    property.totalBorrowCount += 1;
    this.saveProperty(property);

    this.addAuditLog({
      userId: custodian.id,
      userName: custodian.name,
      userRole: custodian.role,
      action: isOffline ? 'OFFLINE_APPROVE' : 'RELEASE_PROPERTY',
      entityType: 'BORROW_TRANSACTION',
      entityId: transaction.id,
      details: `Released ${property.name} (${property.id}) to ${transaction.borrowerName}. Initial condition: ${condition}`,
      isOfflineAction: isOffline
    });

    if (isOffline) {
      this.enqueueSyncItem({
        entityType: 'BORROW_TRANSACTION',
        action: 'CREATE',
        payload: transaction
      });
    }

    return transaction;
  }

  public createWalkInBorrowing(params: {
    propertyId: string;
    borrower: { id?: string; name: string; email?: string; department: string; phone?: string };
    purpose: string;
    expectedReturnDate: string;
    custodian: User;
    condition?: PropertyCondition;
    notes?: string;
  }): { transaction: BorrowTransaction; isConflict: boolean } {
    const isOffline = !this.isOnline();
    const property = this.getPropertyById(params.propertyId);
    
    // Check conflict: If property is currently marked borrowed on server
    const isConflict = !property || property.status === 'BORROWED';

    const transactions = this.getTransactions();
    const nextNum = transactions.length + 144;
    const now = new Date().toISOString();
    const transactionId = `BR-2026-${String(nextNum).padStart(4, '0')}`;

    const transaction: BorrowTransaction = {
      id: transactionId,
      propertyId: params.propertyId,
      propertyCode: property ? property.id : params.propertyId,
      propertyName: property ? property.name : 'Unknown Equipment',
      borrowerId: params.borrower.id || `walkin_${Date.now()}`,
      borrowerName: params.borrower.name,
      borrowerEmail: params.borrower.email || `${params.borrower.name.toLowerCase().replace(/\s+/g, '.')}@student.univ.edu`,
      borrowerDepartment: params.borrower.department,
      purpose: params.purpose,
      borrowDate: now,
      expectedReturnDate: params.expectedReturnDate,
      actualReleaseDate: now,
      releasedByCustodianId: params.custodian.id,
      releasedByCustodianName: params.custodian.name,
      releaseCondition: params.condition || 'GOOD',
      releaseNotes: params.notes,
      status: isConflict ? 'CONFLICT' : (isOffline ? 'OFFLINE_APPROVED' : 'BORROWED'),
      isWalkIn: true,
      isOfflineCreated: isOffline,
      qrPayload: `https://sopms.app/scan/borrow/${transactionId}`,
      createdAt: now,
      updatedAt: now
    };

    transactions.unshift(transaction);
    this.setItem('transactions', transactions);

    if (property) {
      property.status = 'BORROWED';
      property.currentBorrowingId = transaction.id;
      property.totalBorrowCount = (property.totalBorrowCount || 0) + 1;
      this.saveProperty(property);
    }

    this.addAuditLog({
      userId: params.custodian.id,
      userName: params.custodian.name,
      userRole: params.custodian.role,
      action: isOffline ? 'OFFLINE_APPROVE' : 'CREATE_WALK_IN',
      entityType: 'BORROW_TRANSACTION',
      entityId: transaction.id,
      details: `Walk-in borrowing created for ${params.borrower.name} (${transaction.propertyName}). Status: ${transaction.status}`,
      isOfflineAction: isOffline
    });

    if (isOffline || isConflict) {
      this.enqueueSyncItem({
        entityType: 'BORROW_TRANSACTION',
        action: 'OFFLINE_APPROVE',
        payload: transaction,
        status: isConflict ? 'CONFLICT' : 'PENDING',
        conflictDetails: isConflict ? {
          conflictType: 'PROPERTY_UNAVAILABLE',
          message: `Property ${property?.name || params.propertyId} was already marked as ${property?.status || 'BORROWED'} during offline checkout.`,
          localState: transaction,
          serverState: property
        } : undefined
      });
    }

    return { transaction, isConflict };
  }

  // Return Self-Assessment (Student Submission)
  public getReturnAssessments(): ReturnAssessment[] {
    return this.getItem<ReturnAssessment[]>('return_assessments', INITIAL_RETURN_ASSESSMENTS);
  }

  public submitReturnAssessment(data: {
    borrowTransactionId: string;
    propertyId: string;
    borrowerId: string;
    borrowerName: string;
    conditionDeclared: PropertyCondition;
    descriptionNotes: string;
    photoEvidence: string[];
    accessoriesIncluded: boolean;
    declarationAccepted: boolean;
  }): ReturnAssessment {
    const isOffline = !this.isOnline();
    const assessments = this.getReturnAssessments();
    const nextNum = assessments.length + 43;
    const now = new Date().toISOString();

    const assessment: ReturnAssessment = {
      id: `RET-2026-${String(nextNum).padStart(4, '0')}`,
      ...data,
      submittedAt: now,
      isOfflineSubmitted: isOffline
    };

    assessments.unshift(assessment);
    this.setItem('return_assessments', assessments);

    // Update Transaction status to RETURN_PENDING_REVIEW
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === data.borrowTransactionId);
    if (txIndex >= 0) {
      transactions[txIndex].status = 'RETURN_PENDING_REVIEW';
      transactions[txIndex].returnAssessmentId = assessment.id;
      transactions[txIndex].actualReturnDate = now;
      transactions[txIndex].updatedAt = now;
      this.setItem('transactions', transactions);
    }

    this.addAuditLog({
      userId: data.borrowerId,
      userName: data.borrowerName,
      userRole: 'STUDENT',
      action: 'SUBMIT_RETURN_ASSESSMENT',
      entityType: 'RETURN_ASSESSMENT',
      entityId: assessment.id,
      details: `Student self-assessment submitted: Declared condition [${data.conditionDeclared}] with ${data.photoEvidence.length} photo(s).`,
      isOfflineAction: isOffline
    });

    if (isOffline) {
      this.enqueueSyncItem({
        entityType: 'RETURN_ASSESSMENT',
        action: 'RETURN_SUBMISSION',
        payload: assessment
      });
    }

    return assessment;
  }

  // Custodian Return Review (Accept or Override)
  public getCustodianReviews(): CustodianReview[] {
    return this.getItem<CustodianReview[]>('custodian_reviews', INITIAL_CUSTODIAN_REVIEWS);
  }

  public reviewReturnAssessment(params: {
    returnAssessmentId: string;
    borrowTransactionId: string;
    decision: 'ACCEPT' | 'OVERRIDE';
    finalCondition: PropertyCondition;
    overrideReason?: string;
    conditionNotes?: string;
    maintenanceRecommended?: boolean;
    custodian: User;
  }): CustodianReview | null {
    const isOffline = !this.isOnline();
    const assessments = this.getReturnAssessments();
    const assessment = assessments.find(a => a.id === params.returnAssessmentId);
    if (!assessment) return null;

    const reviews = this.getCustodianReviews();
    const nextNum = reviews.length + 43;
    const now = new Date().toISOString();

    const review: CustodianReview = {
      id: `REV-2026-${String(nextNum).padStart(4, '0')}`,
      returnAssessmentId: assessment.id,
      borrowTransactionId: params.borrowTransactionId,
      propertyId: assessment.propertyId,
      custodianId: params.custodian.id,
      custodianName: params.custodian.name,
      decision: params.decision,
      originalStudentCondition: assessment.conditionDeclared,
      finalCondition: params.finalCondition,
      overrideReason: params.overrideReason,
      conditionNotes: params.conditionNotes,
      maintenanceRecommended: params.maintenanceRecommended,
      reviewedAt: now
    };

    reviews.unshift(review);
    this.setItem('custodian_reviews', reviews);

    // Update Transaction to RETURNED
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex(t => t.id === params.borrowTransactionId);
    if (txIndex >= 0) {
      transactions[txIndex].status = 'RETURNED';
      transactions[txIndex].custodianReviewId = review.id;
      transactions[txIndex].finalCondition = params.finalCondition;
      transactions[txIndex].updatedAt = now;
      this.setItem('transactions', transactions);
    }

    // Update Property condition and status
    const property = this.getPropertyById(assessment.propertyId);
    if (property) {
      property.condition = params.finalCondition;
      property.status = (params.finalCondition === 'MAJOR_DAMAGE' || params.finalCondition === 'MINOR_DAMAGE' || params.maintenanceRecommended)
        ? 'MAINTENANCE'
        : (params.finalCondition === 'MISSING' ? 'ARCHIVED' : 'AVAILABLE');
      property.currentBorrowingId = undefined;
      property.updatedAt = now;
      this.saveProperty(property);
    }

    // Create Damage Report if damaged
    if (params.finalCondition === 'MINOR_DAMAGE' || params.finalCondition === 'MAJOR_DAMAGE' || params.finalCondition === 'MISSING') {
      this.createDamageReport({
        propertyId: assessment.propertyId,
        borrowTransactionId: params.borrowTransactionId,
        reportedBy: params.custodian.name,
        reporterRole: params.custodian.role,
        severity: params.finalCondition === 'MISSING' ? 'TOTAL_LOSS' : (params.finalCondition === 'MAJOR_DAMAGE' ? 'MAJOR' : 'MINOR'),
        description: params.overrideReason || params.conditionNotes || assessment.descriptionNotes,
        photos: assessment.photoEvidence
      });
    }

    // Audit Log
    this.addAuditLog({
      userId: params.custodian.id,
      userName: params.custodian.name,
      userRole: params.custodian.role,
      action: params.decision === 'ACCEPT' ? 'ACCEPT_ASSESSMENT' : 'OVERRIDE_ASSESSMENT',
      entityType: 'RETURN_ASSESSMENT',
      entityId: assessment.id,
      details: params.decision === 'ACCEPT' 
        ? `Accepted student assessment (${params.finalCondition}). Closed transaction.`
        : `OVERRIDDEN student condition [${assessment.conditionDeclared} ➔ ${params.finalCondition}]. Reason: ${params.overrideReason || 'N/A'}`,
      isOfflineAction: isOffline
    });

    if (isOffline) {
      this.enqueueSyncItem({
        entityType: 'CUSTODIAN_REVIEW',
        action: 'OVERRIDE',
        payload: review
      });
    }

    return review;
  }

  // Damage Reports
  public getDamageReports(): DamageReport[] {
    return this.getItem<DamageReport[]>('damage_reports', []);
  }

  public createDamageReport(data: Omit<DamageReport, 'id' | 'createdAt' | 'status'>): DamageReport {
    const reports = this.getDamageReports();
    const nextNum = reports.length + 1;
    const report: DamageReport = {
      id: `DMG-2026-${String(nextNum).padStart(4, '0')}`,
      ...data,
      status: 'PENDING_INSPECTION',
      createdAt: new Date().toISOString()
    };
    reports.unshift(report);
    this.setItem('damage_reports', reports);
    return report;
  }

  // Audit Logs
  public getAuditLogs(): AuditLogEntry[] {
    return this.getItem<AuditLogEntry[]>('audit_logs', INITIAL_AUDIT_LOGS);
  }

  public addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'deviceContext' | 'isOfflineAction'> & { deviceContext?: string; isOfflineAction?: boolean }): void {
    const logs = this.getAuditLogs();
    const isOffline = entry.isOfflineAction !== undefined ? entry.isOfflineAction : !this.isOnline();
    const newEntry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      deviceContext: entry.deviceContext || (isOffline ? 'Offline Local Storage (PWA)' : 'Online Web Cloud Session'),
      isOfflineAction: isOffline,
      ...entry
    };
    logs.unshift(newEntry);
    this.setItem('audit_logs', logs.slice(0, 300)); // Keep last 300
  }

  // Sync Queue
  public getSyncQueue(): SyncQueueItem[] {
    return this.getItem<SyncQueueItem[]>('sync_queue', []);
  }

  public enqueueSyncItem(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'status'> & { status?: SyncQueueItem['status'] }): SyncQueueItem {
    const queue = this.getSyncQueue();
    const newItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      status: item.status || 'PENDING',
      ...item
    };
    queue.push(newItem);
    this.setItem('sync_queue', queue);
    return newItem;
  }

  public removeSyncItem(id: string): void {
    const queue = this.getSyncQueue().filter(i => i.id !== id);
    this.setItem('sync_queue', queue);
  }

  public resolveSyncConflict(queueItemId: string, resolution: 'FORCE_CONFIRM' | 'CANCEL_TRANSACTION'): void {
    const queue = this.getSyncQueue();
    const item = queue.find(i => i.id === queueItemId);
    if (!item) return;

    if (resolution === 'FORCE_CONFIRM') {
      item.status = 'SYNCED';
      if (item.entityType === 'BORROW_TRANSACTION' && item.payload?.id) {
        const transactions = this.getTransactions();
        const tx = transactions.find(t => t.id === item.payload.id);
        if (tx) {
          tx.status = 'BORROWED';
          this.setItem('transactions', transactions);
        }
      }
    } else {
      item.status = 'SYNCED';
      if (item.entityType === 'BORROW_TRANSACTION' && item.payload?.id) {
        const transactions = this.getTransactions();
        const tx = transactions.find(t => t.id === item.payload.id);
        if (tx) {
          tx.status = 'RETURNED';
          this.setItem('transactions', transactions);
        }
      }
    }

    this.setItem('sync_queue', queue);
    this.addAuditLog({
      userId: this.getCurrentUser().id,
      userName: this.getCurrentUser().name,
      userRole: this.getCurrentUser().role,
      action: 'RESOLVE_CONFLICT',
      entityType: 'SYNC',
      entityId: queueItemId,
      details: `Resolved sync conflict with action: ${resolution}`
    });
  }

  public forceSyncAll(): { syncedCount: number; conflictCount: number } {
    const queue = this.getSyncQueue();
    let syncedCount = 0;
    let conflictCount = 0;

    queue.forEach(item => {
      if (item.status === 'PENDING') {
        item.status = 'SYNCED';
        syncedCount++;
      } else if (item.status === 'CONFLICT') {
        conflictCount++;
      }
    });

    this.setItem('sync_queue', queue);
    this.setItem('last_synced_at', new Date().toISOString());

    if (syncedCount > 0) {
      this.addAuditLog({
        userId: this.getCurrentUser().id,
        userName: this.getCurrentUser().name,
        userRole: this.getCurrentUser().role,
        action: 'SYNC_COMPLETE',
        entityType: 'SYNC',
        entityId: `SYNC-${Date.now()}`,
        details: `Offline reconciliation complete. ${syncedCount} queued action(s) reconciled with central registry.`
      });
    }

    return { syncedCount, conflictCount };
  }

  public getLastSyncedAt(): string {
    return this.getItem<string>('last_synced_at', new Date().toISOString());
  }

  public resetAllData(): void {
    localStorage.clear();
    this.initializeIfEmpty(true);
    this.notifyListeners();
  }
}

export const db = SOPMSDatabase.getInstance();
