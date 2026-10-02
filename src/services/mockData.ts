import { 
  User, 
  PropertyCategory, 
  StorageLocation, 
  Property, 
  PropertyRequest, 
  BorrowTransaction, 
  ReturnAssessment, 
  CustodianReview, 
  DamageReport, 
  AuditLogEntry,
  SystemSettings 
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_student_1',
    name: 'Juan Dela Cruz',
    email: 'j.delacruz@student.univ.edu',
    studentId: '2023-04821',
    department: 'Computer Science Society',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+63 917 555 0192'
  },
  {
    id: 'user_student_2',
    name: 'Maria Santos',
    email: 'm.santos@student.univ.edu',
    studentId: '2024-11920',
    department: 'Engineering Student Council',
    role: 'STUDENT',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phone: '+63 918 555 0244'
  },
  {
    id: 'user_custodian_1',
    name: 'Prof. Alex Rivera',
    email: 'a.rivera@univ.edu',
    department: 'Department Property & Equipment Custody',
    role: 'CUSTODIAN',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+63 920 555 0888'
  },
  {
    id: 'user_org_admin_1',
    name: 'Dr. Beatrice Morales',
    email: 'b.morales@univ.edu',
    department: 'Student Affairs & Department Oversight',
    role: 'ORG_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phone: '+63 917 555 0991'
  },
  {
    id: 'user_system_admin_1',
    name: 'Mark Villanueva',
    email: 'm.villanueva@univ.edu',
    department: 'Campus IT & Property Systems',
    role: 'SYSTEM_ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+63 919 555 0100'
  }
];

export const INITIAL_CATEGORIES: PropertyCategory[] = [
  {
    id: 'cat_sound',
    name: 'Sound & Audio Equipment',
    description: 'Bluetooth speakers, PA portable sound boxes, wireless microphones, mixers',
    iconName: 'Volume2'
  },
  {
    id: 'cat_visual',
    name: 'Visual & Projection',
    description: 'Projectors, projection screens, HDMI splitters, clickers',
    iconName: 'Projector'
  },
  {
    id: 'cat_cables',
    name: 'Cables & Power Utilities',
    description: 'Heavy duty extension drum reels, XLR cables, power strips',
    iconName: 'Zap'
  },
  {
    id: 'cat_stage',
    name: 'Stage & Event Lighting',
    description: 'LED par spotlights, DMX lights, stands, backdrop frames',
    iconName: 'Sun'
  },
  {
    id: 'cat_camera',
    name: 'Camera & Documenting',
    description: 'DSLR cameras, tripods, wireless lapel microphones',
    iconName: 'Camera'
  }
];

export const INITIAL_LOCATIONS: StorageLocation[] = [
  {
    id: 'loc_office',
    name: 'Department Custodian Office',
    room: 'Rm 302 (Engineering Building)',
    building: 'Engineering Complex'
  },
  {
    id: 'loc_av_cabinet',
    name: 'AV Storage Locker A',
    room: 'Rm 105 (AV Multi-Purpose Hall)',
    building: 'Student Center'
  },
  {
    id: 'loc_council',
    name: 'Student Council Equipment Vault',
    room: 'Rm 201',
    building: 'Administration Hall'
  }
];

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'SB-0001',
    name: 'JBL PartyBox 310 Bluetooth Speaker',
    categoryId: 'cat_sound',
    serialNumber: 'JBL-PB310-2024-991',
    condition: 'GOOD',
    status: 'BORROWED',
    locationId: 'loc_office',
    qrIdentifier: 'SB-0001',
    photoUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Power Output': '240W RMS',
      'Battery Life': '18 Hours',
      'Connectivity': 'Bluetooth 5.1 / Aux / Dual Mic Inputs',
      'Weight': '17.4 kg'
    },
    notes: 'Includes original heavy-duty power cable and aux lead.',
    totalBorrowCount: 14,
    currentBorrowingId: 'BR-2026-0142',
    createdAt: '2026-01-15T08:00:00.000Z',
    updatedAt: '2026-10-02T08:30:00.000Z'
  },
  {
    id: 'SB-0002',
    name: 'Sony SRS-XP700 Portable Sound Box',
    categoryId: 'cat_sound',
    serialNumber: 'SNY-XP700-4412',
    condition: 'GOOD',
    status: 'AVAILABLE',
    locationId: 'loc_office',
    qrIdentifier: 'SB-0002',
    photoUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Sound Feature': 'Omnidirectional Party Sound & Mega Bass',
      'Battery Life': '25 Hours with Fast Charge',
      'Water Resistance': 'IPX4 Splashproof'
    },
    notes: 'Stored in Department Office. Ready for immediate checkout.',
    totalBorrowCount: 9,
    createdAt: '2026-02-10T09:00:00.000Z',
    updatedAt: '2026-09-28T14:00:00.000Z'
  },
  {
    id: 'MIC-0001',
    name: 'Shure BLX288/PG58 Dual Wireless Mic System',
    categoryId: 'cat_sound',
    serialNumber: 'SHR-BLX-8801',
    condition: 'GOOD',
    status: 'BORROWED',
    locationId: 'loc_av_cabinet',
    qrIdentifier: 'MIC-0001',
    photoUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Channels': 'Dual Channel Receiver + 2 Handheld Transmitters',
      'Range': 'Up to 300 ft (91 m)',
      'Battery': '2x AA Batteries each'
    },
    notes: 'Always check that antenna BNC fittings are secure.',
    totalBorrowCount: 22,
    currentBorrowingId: 'BR-2026-0139',
    createdAt: '2026-01-20T10:00:00.000Z',
    updatedAt: '2026-09-30T16:00:00.000Z'
  },
  {
    id: 'PRJ-0001',
    name: 'Epson PowerLite FH52 Full HD Projector',
    categoryId: 'cat_visual',
    serialNumber: 'EPS-FH52-1092',
    condition: 'GOOD',
    status: 'AVAILABLE',
    locationId: 'loc_office',
    qrIdentifier: 'PRJ-0001',
    photoUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Brightness': '4,000 Lumens Color & White',
      'Resolution': '1080p Full HD (1920 x 1080)',
      'Inputs': 'Dual HDMI, USB, VGA, Miracast'
    },
    notes: 'Pack includes remote control, 5m HDMI cable, power lead in padded bag.',
    totalBorrowCount: 18,
    createdAt: '2026-02-01T08:00:00.000Z',
    updatedAt: '2026-10-01T11:00:00.000Z'
  },
  {
    id: 'PRJ-0002',
    name: 'BenQ Portable Smart LED Projector',
    categoryId: 'cat_visual',
    serialNumber: 'BNQ-GV30-9901',
    condition: 'MINOR_DAMAGE',
    status: 'MAINTENANCE',
    locationId: 'loc_office',
    qrIdentifier: 'PRJ-0002',
    photoUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Audio': '2.1 Channel Bluetooth Speaker built-in',
      'Resolution': '720p HD with autofocus'
    },
    notes: 'HDMI Port 1 loose connection under diagnosis.',
    totalBorrowCount: 11,
    createdAt: '2026-03-05T09:30:00.000Z',
    updatedAt: '2026-09-29T15:20:00.000Z'
  },
  {
    id: 'PWR-0001',
    name: 'Heavy-Duty 30-Meter Drum Extension Reel',
    categoryId: 'cat_cables',
    serialNumber: 'PWR-DRUM-30M',
    condition: 'GOOD',
    status: 'AVAILABLE',
    locationId: 'loc_office',
    qrIdentifier: 'PWR-0001',
    photoUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Length': '30 Meters (4 Outlets)',
      'Rating': '16A 250V with thermal overload cut-off'
    },
    notes: 'Unwind completely when running high power amplifiers.',
    totalBorrowCount: 31,
    createdAt: '2026-01-10T08:00:00.000Z',
    updatedAt: '2026-09-27T09:10:00.000Z'
  },
  {
    id: 'LGT-0001',
    name: 'Stage LED Par Light Quad Set (RGBWA+UV)',
    categoryId: 'cat_stage',
    serialNumber: 'LGT-PAR4-770',
    condition: 'GOOD',
    status: 'AVAILABLE',
    locationId: 'loc_av_cabinet',
    qrIdentifier: 'LGT-0001',
    photoUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Configuration': '4x 54W Slim PAR Lights with DMX cables',
      'Control': 'Auto, Sound Active, Master/Slave, DMX512'
    },
    notes: 'Pack contains 4 lamps and 4 floor brackets.',
    totalBorrowCount: 8,
    createdAt: '2026-04-12T14:00:00.000Z',
    updatedAt: '2026-09-25T13:00:00.000Z'
  },
  {
    id: 'CAM-0001',
    name: 'Canon EOS R50 Mirrorless Camera Kit',
    categoryId: 'cat_camera',
    serialNumber: 'CAN-R50-0044',
    condition: 'GOOD',
    status: 'AVAILABLE',
    locationId: 'loc_council',
    qrIdentifier: 'CAM-0001',
    photoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    specs: {
      'Sensor': '24.2 MP APS-C CMOS',
      'Video': '4K uncropped 30p',
      'Lens': 'RF-S 18-45mm IS STM'
    },
    notes: 'Comes with 128GB SanDisk Extreme SD card, 2 batteries, and charger.',
    totalBorrowCount: 15,
    createdAt: '2026-03-01T11:00:00.000Z',
    updatedAt: '2026-09-30T17:40:00.000Z'
  }
];

export const INITIAL_REQUESTS: PropertyRequest[] = [
  {
    id: 'REQ-2026-0081',
    propertyId: 'SB-0002',
    borrowerId: 'user_student_2',
    borrowerName: 'Maria Santos',
    borrowerDepartment: 'Engineering Student Council',
    purpose: 'Inter-Department Engineering Quiz Bee 2026 opening ceremony and sound moderation.',
    eventTitle: 'Engineering Quiz Bee 2026',
    borrowDate: '2026-10-03T08:00:00.000Z',
    expectedReturnDate: '2026-10-03T18:00:00.000Z',
    responsiblePerson: 'Maria Santos (Council Vice President)',
    contactNumber: '+63 918 555 0244',
    remarks: 'Will need 1 wireless mic receiver if available.',
    status: 'PENDING',
    createdAt: '2026-10-02T07:15:00.000Z',
    updatedAt: '2026-10-02T07:15:00.000Z'
  },
  {
    id: 'REQ-2026-0080',
    propertyId: 'PRJ-0001',
    borrowerId: 'user_student_1',
    borrowerName: 'Juan Dela Cruz',
    borrowerDepartment: 'Computer Science Society',
    purpose: 'Tech Workshop on Progressive Web Apps & Offline First Computing.',
    eventTitle: 'DevCon Tech Workshop Series',
    borrowDate: '2026-10-04T13:00:00.000Z',
    expectedReturnDate: '2026-10-04T17:30:00.000Z',
    responsiblePerson: 'Juan Dela Cruz (CSS President)',
    contactNumber: '+63 917 555 0192',
    remarks: 'Approved by custodian remotely. Awaiting scheduled pickup.',
    status: 'APPROVED',
    reviewedBy: 'user_custodian_1',
    reviewedAt: '2026-10-01T14:30:00.000Z',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T14:30:00.000Z'
  }
];

export const INITIAL_TRANSACTIONS: BorrowTransaction[] = [
  {
    id: 'BR-2026-0142',
    requestId: 'REQ-2026-0078',
    propertyId: 'SB-0001',
    propertyCode: 'SB-0001',
    propertyName: 'JBL PartyBox 310 Bluetooth Speaker',
    borrowerId: 'user_student_1',
    borrowerName: 'Juan Dela Cruz',
    borrowerEmail: 'j.delacruz@student.univ.edu',
    borrowerDepartment: 'Computer Science Society',
    purpose: 'CSS General Assembly & Welcome Orientation for Freshman Batch',
    borrowDate: '2026-10-02T08:00:00.000Z',
    expectedReturnDate: '2026-10-02T19:00:00.000Z',
    actualReleaseDate: '2026-10-02T08:15:00.000Z',
    releasedByCustodianId: 'user_custodian_1',
    releasedByCustodianName: 'Prof. Alex Rivera',
    releaseCondition: 'GOOD',
    releaseNotes: 'Checked speaker output and wheels. All accessories intact.',
    status: 'BORROWED',
    isWalkIn: false,
    isOfflineCreated: false,
    qrPayload: 'https://sopms.app/scan/borrow/BR-2026-0142',
    createdAt: '2026-10-02T08:00:00.000Z',
    updatedAt: '2026-10-02T08:15:00.000Z'
  },
  {
    id: 'BR-2026-0139',
    requestId: 'REQ-2026-0075',
    propertyId: 'MIC-0001',
    propertyCode: 'MIC-0001',
    propertyName: 'Shure BLX288/PG58 Dual Wireless Mic System',
    borrowerId: 'user_student_2',
    borrowerName: 'Maria Santos',
    borrowerEmail: 'm.santos@student.univ.edu',
    borrowerDepartment: 'Engineering Student Council',
    purpose: 'Faculty General Meeting & Student Dialogue Forum',
    borrowDate: '2026-09-30T10:00:00.000Z',
    expectedReturnDate: '2026-10-01T17:00:00.000Z', // Overdue
    actualReleaseDate: '2026-09-30T10:10:00.000Z',
    releasedByCustodianId: 'user_custodian_1',
    releasedByCustodianName: 'Prof. Alex Rivera',
    releaseCondition: 'GOOD',
    status: 'BORROWED',
    isWalkIn: true,
    isOfflineCreated: false,
    qrPayload: 'https://sopms.app/scan/borrow/BR-2026-0139',
    createdAt: '2026-09-30T10:00:00.000Z',
    updatedAt: '2026-09-30T10:10:00.000Z'
  },
  {
    id: 'BR-2026-0135',
    requestId: 'REQ-2026-0071',
    propertyId: 'PWR-0001',
    propertyCode: 'PWR-0001',
    propertyName: 'Heavy-Duty 30-Meter Drum Extension Reel',
    borrowerId: 'user_student_1',
    borrowerName: 'Juan Dela Cruz',
    borrowerEmail: 'j.delacruz@student.univ.edu',
    borrowerDepartment: 'Computer Science Society',
    purpose: 'Outdoor Hackathon setup at University Quadrangle',
    borrowDate: '2026-09-26T09:00:00.000Z',
    expectedReturnDate: '2026-09-27T08:00:00.000Z',
    actualReleaseDate: '2026-09-26T09:05:00.000Z',
    actualReturnDate: '2026-09-27T08:30:00.000Z',
    releasedByCustodianId: 'user_custodian_1',
    releasedByCustodianName: 'Prof. Alex Rivera',
    releaseCondition: 'GOOD',
    status: 'RETURNED',
    isWalkIn: false,
    isOfflineCreated: false,
    qrPayload: 'https://sopms.app/scan/borrow/BR-2026-0135',
    returnAssessmentId: 'RET-2026-0038',
    custodianReviewId: 'REV-2026-0038',
    finalCondition: 'GOOD',
    createdAt: '2026-09-26T09:00:00.000Z',
    updatedAt: '2026-09-27T09:00:00.000Z'
  }
];

export const INITIAL_RETURN_ASSESSMENTS: ReturnAssessment[] = [
  {
    id: 'RET-2026-0038',
    borrowTransactionId: 'BR-2026-0135',
    propertyId: 'PWR-0001',
    borrowerId: 'user_student_1',
    borrowerName: 'Juan Dela Cruz',
    conditionDeclared: 'GOOD',
    descriptionNotes: 'Tested all 4 sockets with tester. Cable rewound cleanly and safely.',
    photoEvidence: [
      'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=500&auto=format&fit=crop&q=80'
    ],
    accessoriesIncluded: true,
    declarationAccepted: true,
    submittedAt: '2026-09-27T08:30:00.000Z',
    isOfflineSubmitted: false
  }
];

export const INITIAL_CUSTODIAN_REVIEWS: CustodianReview[] = [
  {
    id: 'REV-2026-0038',
    returnAssessmentId: 'RET-2026-0038',
    borrowTransactionId: 'BR-2026-0135',
    propertyId: 'PWR-0001',
    custodianId: 'user_custodian_1',
    custodianName: 'Prof. Alex Rivera',
    decision: 'ACCEPT',
    originalStudentCondition: 'GOOD',
    finalCondition: 'GOOD',
    conditionNotes: 'Verified clean return. Ready for next borrowing cycle.',
    maintenanceRecommended: false,
    reviewedAt: '2026-09-27T09:00:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_01',
    timestamp: '2026-10-02T08:15:00.000Z',
    userId: 'user_custodian_1',
    userName: 'Prof. Alex Rivera',
    userRole: 'CUSTODIAN',
    action: 'RELEASE_PROPERTY',
    entityType: 'BORROW_TRANSACTION',
    entityId: 'BR-2026-0142',
    details: 'Released JBL PartyBox 310 to Juan Dela Cruz in GOOD condition.',
    deviceContext: 'Custodian Tablet (Online)',
    isOfflineAction: false
  },
  {
    id: 'aud_02',
    timestamp: '2026-10-02T07:15:00.000Z',
    userId: 'user_student_2',
    userName: 'Maria Santos',
    userRole: 'STUDENT',
    action: 'SUBMIT_REQUEST',
    entityType: 'REQUEST',
    entityId: 'REQ-2026-0081',
    details: 'Submitted borrowing request for Sony Sound Box for Engineering Quiz Bee.',
    deviceContext: 'Student Mobile PWA (Online)',
    isOfflineAction: false
  },
  {
    id: 'aud_03',
    timestamp: '2026-10-01T14:30:00.000Z',
    userId: 'user_custodian_1',
    userName: 'Prof. Alex Rivera',
    userRole: 'CUSTODIAN',
    action: 'APPROVE_REQUEST',
    entityType: 'REQUEST',
    entityId: 'REQ-2026-0080',
    details: 'Remotely approved request for Epson Projector (Juan Dela Cruz).',
    deviceContext: 'Custodian Desktop Portal (Online)',
    isOfflineAction: false
  },
  {
    id: 'aud_04',
    timestamp: '2026-09-27T09:00:00.000Z',
    userId: 'user_custodian_1',
    userName: 'Prof. Alex Rivera',
    userRole: 'CUSTODIAN',
    action: 'ACCEPT_ASSESSMENT',
    entityType: 'RETURN_ASSESSMENT',
    entityId: 'RET-2026-0038',
    details: 'Accepted student self-assessment for Heavy-Duty Extension Reel as GOOD. Property returned to AVAILABLE.',
    deviceContext: 'Custodian Mobile PWA (Online)',
    isOfflineAction: false
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  autoFlagOverdueHours: 2,
  requirePhotosOnGoodReturn: false,
  requirePhotosOnDamagedReturn: true,
  allowWalkInImmediateApproval: true,
  organizationName: 'College of Engineering & Computer Studies',
  departmentName: 'Department Property & Equipment Custody',
  custodianContact: 'custody.eecs@univ.edu · Rm 302 Admin'
};
