/**
 * Business Logic Layer for Lead Management
 * Contains all core functions for stage management, validation, and data manipulation
 */

import type { LeadData, TaskData, UniversityAppData } from '@/types/lead';

// Complete pipeline stages
export const PIPELINE_STAGES = [
  'Yet to Assign',
  'Yet to Contact',
  'Contact Again',
  'Not Interested',
  'Planning Later',
  'Yet to Decide',
  'Irrelevant Lead',
  'Registered for Session',
  'Session Scheduled',
  'Session Completed',
  'Docs Submitted',
  'Shortlisted Univ.',
  'Application in Progress',
  'Offer Letter Received',
  'Deposit Paid',
  'Visa Received',
  'Flight and Accommodation Booked',
  'Tuition Fee Paid',
  'Commission Received',
  'Interested',
  'Join Later',
  'Language Reassignment',
  'Casual Follow-up'
];

/**
 * Get numeric index of a stage
 */
export const getStageIndex = (stage: string): number => {
  return PIPELINE_STAGES.indexOf(stage);
};

/**
 * Check if current stage is at or after target stage
 */
export const isStageAtOrAfter = (currentStage: string, targetStage: string): boolean => {
  const currentIndex = getStageIndex(currentStage);
  const targetIndex = getStageIndex(targetStage);
  return currentIndex >= targetIndex;
};

/**
 * Calculate stage progress percentage
 */
export const calculateStageProgress = (stage: string): number => {
  const index = getStageIndex(stage);
  if (index === -1) return 0;
  return Math.round(((index + 1) / PIPELINE_STAGES.length) * 100);
};

/**
 * Find or create university record
 */
export const upsertChild = (lead: LeadData, universityName: string): UniversityAppData => {
  const existing = (lead as any).universities?.find(
    (u: UniversityAppData) => u.universityName === universityName
  );
  
  if (existing) return existing;
  
  return {
    universityName,
    status: 'Draft',
    createdAt: new Date().toISOString()
  };
};

/**
 * Save university child with audit trail
 */
export const saveChild = (
  lead: LeadData,
  child: UniversityAppData,
  patch: Partial<UniversityAppData>,
  user: { id: number; name: string }
): UniversityAppData => {
  const updated = { ...child, ...patch, updatedAt: new Date().toISOString() };
  
  // Add audit entry
  if (!updated.audit) updated.audit = [];
  updated.audit.push({
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    changes: Object.keys(patch)
  });
  
  return updated;
};

/**
 * Set active university (deactivates others)
 */
export const setActiveChild = (lead: LeadData, childId: number): LeadData => {
  const universities = (lead as any).universities || [];
  const updated = universities.map((u: UniversityAppData) => ({
    ...u,
    isActive: u.id === childId
  }));
  
  return { ...lead, universities: updated } as LeadData;
};

/**
 * Ensure "Application in Progress" stage
 */
export const ensureAppInProgress = (lead: LeadData): { stage: string; changed: boolean } => {
  const universities = (lead as any).universities || [];
  const hasActiveApp = universities.some((u: UniversityAppData) =>
    ['Submitted', 'Offer Received', 'In Progress'].includes(u.status || '')
  );
  
  if (hasActiveApp && !isStageAtOrAfter(lead.currentStage, 'Application in Progress')) {
    return { stage: 'Application in Progress', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Ensure "Offer Letter Received" stage
 */
export const ensureOfferLetterReceived = (lead: LeadData): { stage: string; changed: boolean } => {
  const universities = (lead as any).universities || [];
  const activeUniversity = universities.find((u: UniversityAppData) => u.isActive);
  
  if (
    activeUniversity?.status === 'Offer Received' &&
    !isStageAtOrAfter(lead.currentStage, 'Offer Letter Received')
  ) {
    return { stage: 'Offer Letter Received', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Ensure "Visa Received" stage
 */
export const ensureVisaReceived = (lead: LeadData): { stage: string; changed: boolean } => {
  const visaStatus = (lead as any).visaStatus;
  
  if (visaStatus === 'Visa Approved' && !isStageAtOrAfter(lead.currentStage, 'Visa Received')) {
    return { stage: 'Visa Received', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Ensure "Deposit Paid" stage
 */
export const ensureDepositPaid = (lead: LeadData): { stage: string; changed: boolean } => {
  const universities = (lead as any).universities || [];
  const activeUniversity = universities.find((u: UniversityAppData) => u.isActive);
  
  if (
    activeUniversity?.depositProof &&
    activeUniversity?.depositDate &&
    !isStageAtOrAfter(lead.currentStage, 'Deposit Paid')
  ) {
    return { stage: 'Deposit Paid', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Ensure "Tuition Fee Paid" stage
 */
export const ensureTuitionFeePaid = (lead: LeadData): { stage: string; changed: boolean } => {
  const universities = (lead as any).universities || [];
  const activeUniversity = universities.find((u: UniversityAppData) => u.isActive);
  
  if (
    activeUniversity?.tuitionProof &&
    activeUniversity?.tuitionDate &&
    !isStageAtOrAfter(lead.currentStage, 'Tuition Fee Paid')
  ) {
    return { stage: 'Tuition Fee Paid', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Ensure "Commission Received" stage
 */
export const ensureCommissionReceived = (lead: LeadData): { stage: string; changed: boolean } => {
  const universities = (lead as any).universities || [];
  const activeUniversity = universities.find((u: UniversityAppData) => u.isActive);
  
  if (
    activeUniversity?.commissionProof &&
    activeUniversity?.commissionDate &&
    !isStageAtOrAfter(lead.currentStage, 'Commission Received')
  ) {
    return { stage: 'Commission Received', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Maybe move to "Shortlisted Univ." stage
 */
export const maybeMoveShortlistingStage = (
  lead: LeadData,
  finalStatus: string
): { stage: string; changed: boolean } => {
  const docsSubmitted = (lead as any).passportStatus === 'Submitted';
  
  if (
    finalStatus === 'Send to Student' &&
    docsSubmitted &&
    !isStageAtOrAfter(lead.currentStage, 'Shortlisted Univ.')
  ) {
    return { stage: 'Shortlisted Univ.', changed: true };
  }
  
  return { stage: lead.currentStage, changed: false };
};

/**
 * Map tracking status to canonical status
 */
export const mapTrackingStatusToChildStatus = (trackingStatus: string): string => {
  const mapping: Record<string, string> = {
    'Application submitted to KC': 'Submitted',
    'Application submitted to university': 'Submitted',
    'Docs Pending': 'In Progress',
    'In Progress': 'In Progress',
    'Awaiting decision': 'Submitted',
    'Accepted': 'Offer Received',
    'Rejected': 'Rejected'
  };
  
  return mapping[trackingStatus] || trackingStatus;
};

/**
 * Validate task form data
 */
export const validateTaskForm = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Global validations
  if (!data.remarks || data.remarks.trim() === '') {
    errors.push('Remarks are required');
  }
  
  // Task type specific validations
  if (data.taskType === 'Call Task') {
    if (!data.callStatus) errors.push('Call Status is required');
    if (data.callStatus === 'Call Done' && !data.callType) {
      errors.push('Call Type is required when call is done');
    }
  }
  
  if (data.taskType === 'Application Process') {
    if (!data.applicationCount || data.applicationCount < 1 || data.applicationCount > 7) {
      errors.push('Applications count must be between 1 and 7');
    }
  }
  
  return { valid: errors.length === 0, errors };
};

/**
 * Add audit entry to entity
 */
export const addAuditEntry = (
  entity: any,
  changes: Record<string, any>,
  user: { id: number; name: string }
): any => {
  if (!entity.audit) entity.audit = [];
  
  entity.audit.push({
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    changes: Object.keys(changes)
  });
  
  return entity;
};

/**
 * Encrypt password (mock implementation - use proper encryption in production)
 */
export const encrypt = (password: string): string => {
  return btoa(password) + '_encrypted';
};

/**
 * Decrypt password
 */
export const decrypt = (encrypted: string): string => {
  if (!encrypted.endsWith('_encrypted')) return encrypted;
  return atob(encrypted.replace('_encrypted', ''));
};
