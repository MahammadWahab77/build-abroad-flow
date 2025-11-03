export interface TaskData {
  id?: number;
  taskType?: string;
  callType?: string;
  connectStatus?: string;
  country?: string;
  intake?: string;
  prevConsultancy?: string;
  sessionStatus?: string;
  sessionDate?: string;
  isRescheduled?: string;
  shortlistingInitiated?: string;
  shortlistingStatus?: string;
  shortlistingFinalStatus?: string;
  applicationProcess?: string;
  applicationCount?: string;
  trackingStatus?: string;
  applicationStatus?: string;
  offerLetterStatus?: string;
  visaStatus?: string;
  depositStatus?: string;
  tuitionStatus?: string;
  commissionStatus?: string;
  remarks?: string;
  universityName?: string;
  universityUrl?: string;
  username?: string;
  password?: string;
  reasonNotInterested?: string;
  preferredLanguage?: string;
  userId?: number;
  userName?: string;
  createdAt?: string;
}

export interface RemarkData {
  id?: number;
  content: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

export interface StageHistoryData {
  id?: number;
  fromStage?: string;
  toStage: string;
  userId: number;
  userName?: string;
  reason?: string;
  createdAt: string;
}

export interface UniversityAppData {
  id?: number;
  universityName: string;
  universityUrl?: string;
  username?: string;
  password?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  trackedCount?: number;
  substatus?: string;
  applicationReferenceId?: string;
  submissionProof?: string;
  submittedAt?: string;
  portalUsername?: string;
  portalPasswordEncrypted?: string;
  offerType?: 'Conditional' | 'Unconditional';
  offerLetterFile?: string;
  offerReceivedAt?: string;
  visaStatus?: string;
  depositProof?: string;
  depositDate?: string;
  tuitionProof?: string;
  tuitionDate?: string;
  commissionProof?: string;
  commissionDate?: string;
  isActive?: boolean;
  audit?: Array<{
    timestamp: string;
    userId: number;
    userName: string;
    changes: string[];
  }>;
}

export interface LeadData {
  id: number;
  uid?: string;
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  course?: string;
  intake?: string;
  source?: string;
  passportStatus?: string;
  currentStage: string;
  counselorName?: string;
  createdAt: string;
}

export interface DocumentData {
  id: number;
  leadId: number;
  documentType: string;
  documentUrl: string;
  remarks?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

