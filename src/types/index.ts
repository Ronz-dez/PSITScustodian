/**
 * Student Organization Property Management System
 * Core Data Models & Type Definitions
 */

export type UserRole = 'STUDENT' | 'CUSTODIAN' | 'ORG_ADMIN' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId?: string;
  department: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
}

export type PropertyCondition = 'GOOD' | 'MINOR_DAMAGE' | 'MAJOR_DAMAGE' | 'MISSING';

export type PropertyStatus = 
  | 'AVAILABLE'
  | 'RESERVED'
  | 'BORROWED'
  | 'MAINTENANCE'
  | 'ARCHIVED';

export interface PropertyCategory {
  id: string;
  name: string;
  description: string;
  iconName: string;
}

export interface StorageLocation {
  id: string;
  name: string;
  room: string;
  building: string;
}

export interface Property {
  id: string; // e.g. "SB-0001"
  name: string;
  categoryId: string;
  serialNumber?: string;
  condition: PropertyCondition;
  status: PropertyStatus;
  locationId: string;
  qrIdentifier: string; // e.g. "SB-0001" or url
  photoUrl?: string;
  specs?: Record<string, string>;
  notes?: string;
  currentBorrowingId?: string;
  totalBorrowCount: number;
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVISION_REQUIRED'
  | 'CANCELLED';

export interface PropertyRequest {
  id: string; // e.g. "REQ-2026-0081"
  propertyId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerDepartment: string;
  purpose: string;
  eventTitle?: string;
  borrowDate: string; // ISO string
  expectedReturnDate: string; // ISO string
  responsiblePerson: string;
  contactNumber: string;
  remarks?: string;
  status: RequestStatus;
  custodianNotes?: string;
  rejectionReason?: string;
  revisionNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BorrowTransactionStatus = 
  | 'APPROVED'
  | 'OFFLINE_APPROVED'
  | 'RELEASED'
  | 'BORROWED'
  | 'RETURN_PENDING_REVIEW'
  | 'RETURNED'
  | 'SYNC_PENDING'
  | 'CONFLICT';

export interface BorrowTransaction {
  id: string; // e.g. "BR-2026-0142"
  requestId?: string;
  propertyId: string;
  propertyCode: string;
  propertyName: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  borrowerDepartment: string;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReleaseDate?: string;
  actualReturnDate?: string;
  releasedByCustodianId?: string;
  releasedByCustodianName?: string;
  releaseCondition: PropertyCondition;
  releaseNotes?: string;
  status: BorrowTransactionStatus;
  isWalkIn: boolean;
  isOfflineCreated: boolean;
  qrPayload: string; // e.g. "BR-2026-0142"
  returnAssessmentId?: string;
  custodianReviewId?: string;
  finalCondition?: PropertyCondition;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnAssessment {
  id: string; // e.g. "RET-2026-0042"
  borrowTransactionId: string;
  propertyId: string;
  borrowerId: string;
  borrowerName: string;
  conditionDeclared: PropertyCondition;
  descriptionNotes: string;
  photoEvidence: string[]; // Base64 or Object URLs
  accessoriesIncluded: boolean;
  declarationAccepted: boolean;
  submittedAt: string;
  isOfflineSubmitted: boolean;
}

export type CustodianReviewDecision = 'ACCEPT' | 'OVERRIDE';

export interface CustodianReview {
  id: string; // e.g. "REV-2026-0042"
  returnAssessmentId: string;
  borrowTransactionId: string;
  propertyId: string;
  custodianId: string;
  custodianName: string;
  decision: CustodianReviewDecision;
  originalStudentCondition: PropertyCondition;
  finalCondition: PropertyCondition;
  overrideReason?: string;
  conditionNotes?: string;
  maintenanceRecommended?: boolean;
  reviewedAt: string;
}

export interface DamageReport {
  id: string;
  propertyId: string;
  borrowTransactionId?: string;
  reportedBy: string;
  reporterRole: UserRole;
  severity: 'MINOR' | 'MAJOR' | 'TOTAL_LOSS';
  description: string;
  estimatedRepairCost?: number;
  status: 'PENDING_INSPECTION' | 'IN_REPAIR' | 'REPAIRED' | 'WRITTEN_OFF';
  photos: string[];
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 
    | 'LOGIN'
    | 'SUBMIT_REQUEST'
    | 'APPROVE_REQUEST'
    | 'REJECT_REQUEST'
    | 'REVISE_REQUEST'
    | 'OFFLINE_APPROVE'
    | 'RELEASE_PROPERTY'
    | 'SUBMIT_RETURN_ASSESSMENT'
    | 'ACCEPT_ASSESSMENT'
    | 'OVERRIDE_ASSESSMENT'
    | 'CREATE_WALK_IN'
    | 'MODIFY_PROPERTY'
    | 'ARCHIVE_PROPERTY'
    | 'RESOLVE_CONFLICT'
    | 'SYNC_COMPLETE'
    | 'SYSTEM_RESET';
  entityType: 'PROPERTY' | 'REQUEST' | 'BORROW_TRANSACTION' | 'RETURN_ASSESSMENT' | 'USER' | 'SYNC';
  entityId: string;
  details: string;
  deviceContext: string;
  isOfflineAction: boolean;
}

export type SyncStatus = 'PENDING' | 'SYNCED' | 'CONFLICT' | 'FAILED';

export interface SyncQueueItem {
  id: string;
  entityType: 'REQUEST' | 'BORROW_TRANSACTION' | 'RETURN_ASSESSMENT' | 'CUSTODIAN_REVIEW' | 'PROPERTY';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'OFFLINE_APPROVE' | 'RETURN_SUBMISSION' | 'OVERRIDE';
  payload: any;
  createdAt: string;
  status: SyncStatus;
  errorMessage?: string;
  conflictDetails?: {
    conflictType: 'CONCURRENT_BOOKING' | 'STATUS_MISMATCH' | 'PROPERTY_UNAVAILABLE';
    message: string;
    serverState?: any;
    localState?: any;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SystemSettings {
  autoFlagOverdueHours: number;
  requirePhotosOnGoodReturn: boolean;
  requirePhotosOnDamagedReturn: boolean;
  allowWalkInImmediateApproval: boolean;
  organizationName: string;
  departmentName: string;
  custodianContact: string;
}
