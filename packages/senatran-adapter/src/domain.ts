export interface DriverRecord {
  cpf?: string;
  name?: string;
  birthDate?: string;
  licenseNumber?: string;
  renachFormNumber?: string;
  currentCategory?: string;
  authorizedCategory?: string;
  licenseState?: string;
  jurisdictionState?: string;
  licenseStatus?: string;
  licenseStatusDescription?: string;
  licenseExpiresAt?: string;
  medicalRestrictions?: string;
  occurrenceCount: number;
}

export interface VehicleRecord {
  plate?: string;
  chassis?: string;
  renavam?: string;
  jurisdictionState?: string;
  makeModelCode?: string;
  makeModelDescription?: string;
  ownerDocument?: string;
  ownerName?: string;
  stolen: boolean;
  judicialRestriction: boolean;
}

export interface TrafficViolationRecord {
  aitNumber?: string;
  renainfNumber?: string;
  agencyCode?: string;
  agencyState?: string;
  infractionCode?: string;
  infractionDescription?: string;
  occurredAt?: string;
  plate?: string;
  renavam?: string;
  municipalityCode?: string;
  municipalityName?: string;
  amount?: number;
  paidAmount?: number;
  paymentDate?: string;
}

export type DriverProcessType =
  'FIRST_LICENSE' | 'RENEWAL' | 'CATEGORY_CHANGE' | 'CATEGORY_ADDITION';

export interface OpenDriverProcessInput {
  cpf: string;
  processType: DriverProcessType;
  currentCategory?: string;
  requestedCategory?: string;
}

export interface DriverProcess {
  protocol?: string;
  renachNumber?: string;
  status?: string;
  processType?: DriverProcessType;
  currentCategory?: string;
  requestedCategory?: string;
  driver?: Pick<DriverRecord, 'cpf' | 'name' | 'birthDate'>;
  openingResult?: 'OPENED' | 'ALREADY_OPEN';
}

export interface DriverLicenseValidationInput {
  cpf: string;
  licenseNumber: string;
  securityNumber: string;
}

export interface DriverLicenseValidation {
  valid: true;
  driver: DriverRecord;
}

export interface TrafficViolationInput {
  aitNumber: string;
  agencyCode: string;
  issuingAgent: { cpf: string; registration: string };
  device?: { id?: string; issuedOffline?: boolean };
  infraction: {
    code: string;
    unfoldingCode?: string;
    description?: string;
    occurredAt: string;
    municipalityCode: string;
    location: { description?: string; latitude?: number; longitude?: number };
  };
  vehicle: {
    plate: string;
    renavam?: string;
    state?: string;
    makeModelDescription?: string;
  };
  driver?: {
    approached?: boolean;
    cpf?: string;
    licenseNumber?: string;
    state?: string;
    refusedToSign?: boolean;
  };
  evidence?: Array<{
    type?: string;
    hash?: string;
    contentType?: string;
    storageUrl?: string;
  }>;
}

export interface TrafficViolation {
  protocol?: string;
  aitNumber?: string;
  status?: string;
  agencyCode?: string;
  infractionCode?: string;
  occurredAt?: string;
  plate?: string;
}

export interface AdministrativeCase {
  protocol?: string;
  caseId?: string;
  aitNumber?: string;
  status?: string;
  agencyCode?: string;
  amount?: number;
}

export interface Applicant {
  type: 'OWNER' | 'IDENTIFIED_DRIVER' | 'LEGAL_REPRESENTATIVE';
  document: string;
  name?: string;
}

export interface Attachment {
  name?: string;
  contentType?: string;
  hash?: string;
  storageUrl?: string;
}

export interface PreliminaryDefenseInput {
  applicant: Applicant;
  arguments: string;
  attachments?: Attachment[];
  submittedAt: string;
  channel?: string;
}

export interface AppealInput {
  instance: 'JARI' | 'SECOND_INSTANCE';
  previousAppealId?: string;
  applicant: Applicant;
  arguments: string;
  attachments?: Attachment[];
  submittedAt?: string;
  channel?: string;
}

export interface Appeal {
  protocol?: string;
  appealId?: string;
  caseId?: string;
  instance?: 'JARI' | 'SECOND_INSTANCE';
  status?: string;
}

export interface AppealSearchFilters {
  agencyCode?: string;
  status?: string;
  instance?: Appeal['instance'];
  startedAt?: string;
  endedAt?: string;
  limit?: number;
  after?: string;
}

export interface AppealSearchResult {
  count: number;
  appeals: Appeal[];
  nextAfter?: string;
}

export interface AppealDecisionInput {
  outcome: 'GRANTED' | 'DENIED';
  decidedAt?: string;
  reasoning?: string;
  digitalSignature?: {
    certificate?: string;
    hash?: string;
    signedAt?: string;
  };
}

export type CrashSeverity =
  'NO_VICTIMS' | 'WITH_INJURED_VICTIM' | 'WITH_FATAL_VICTIM';

export interface CrashVehicle {
  plate?: string;
  renavam?: string;
  involvementType?: string;
  damage?: string;
}

export interface CrashPerson {
  cpf?: string;
  involvementType?: string;
  name?: string;
}

export interface CrashVictim {
  cpf?: string;
  involvementType?: string;
  injurySeverity?: string;
  diedAtScene?: boolean;
  deathAt?: string;
}

export interface CrashEvidence {
  type?: string;
  fileName?: string;
  url?: string;
  hash?: string;
}

export interface CrashReportInput {
  occurredAt: string;
  state: string;
  municipalityCode: string;
  severity: CrashSeverity;
  location?: string;
  latitude?: string;
  longitude?: string;
  responsibleAgency?: string;
  crashTypeCode?: string;
  roadConditions?: string;
  weatherConditions?: string;
  layoutVersion?: string;
  transmittedAt?: string;
  vehicles?: CrashVehicle[];
  people?: CrashPerson[];
  victims?: CrashVictim[];
  evidence?: CrashEvidence[];
  references?: {
    renavam?: string;
    driverCpf?: string;
    aitNumber?: string;
  };
}

export interface CrashReport {
  protocol?: string;
  crashId?: string;
  status?: string;
  occurredAt?: string;
  state?: string;
  municipalityCode?: string;
  severity?: CrashSeverity;
  location?: string;
  latitude?: string;
  longitude?: string;
  responsibleAgency?: string;
  crashTypeCode?: string;
  roadConditions?: string;
  weatherConditions?: string;
  vehicles?: CrashVehicle[];
  people?: CrashPerson[];
  victims?: CrashVictim[];
  evidence?: CrashEvidence[];
  references?: CrashReportInput['references'];
  transmittedAt?: string;
}

export interface CrashSearchFilters {
  plate?: string;
  driverCpf?: string;
  startedAt?: string;
  endedAt?: string;
  responsibleAgency?: string;
  limit?: number;
  after?: string;
}

export interface CrashSearchResult {
  count: number;
  crashes: CrashReport[];
  nextAfter?: string;
}

export interface CrashCorrectionInput {
  reason?: string;
  layoutVersion?: string;
  severity?: CrashSeverity;
  location?: string;
  latitude?: string;
  longitude?: string;
  victims?: CrashVictim[];
  vehicles?: CrashVehicle[];
  people?: CrashPerson[];
  evidence?: CrashEvidence[];
  references?: CrashReportInput['references'];
}

export interface CrashCorrection {
  correctionId?: string;
  crashId?: string;
  type?: 'COMPLEMENT' | 'CORRECTION';
  protocol?: string;
  status?: string;
}

export interface SneEnrollment {
  plate?: string;
  cpf?: string;
  agencyCode?: string;
  enrolled: boolean;
  channel?: string;
}

export interface SneNotificationInput {
  aitNumber: string;
  agencyCode: string;
  caseId?: string;
  plate?: string;
  recipientCpf?: string;
  channel?: 'APP_CDT' | 'EMAIL' | 'SMS' | 'UNAVAILABLE';
  infractionDate?: string;
  notificationDate?: string;
  message?: string;
}

export interface SneNotification {
  protocol?: string;
  aitNumber?: string;
  caseId?: string;
  type?: 'INFRACTION_NOTICE' | 'PENALTY_NOTICE';
  agencyCode?: string;
  plate?: string;
  recipientCpf?: string;
  status?: string;
  channel?: string;
  notificationDate?: string;
}

export interface CitizenCollection<T> {
  cpf?: string;
  items: T[];
}

export interface CitizenLicense {
  cpf?: string;
  license: Record<string, unknown>;
}

export interface PaymentQuote {
  aitNumber?: string;
  cpf?: string;
  status?: string;
  originalAmount?: number;
  discountPercent?: number;
  discountedAmount?: number;
  paymentSlipAvailable?: boolean;
  digitLine?: string;
  dueDate?: string;
}

export interface InfractionRecognition {
  aitNumber?: string;
  status?: string;
  discountPercent?: number;
  originalAmount?: number;
  discountedAmount?: number;
  paymentSlipAvailable?: boolean;
  digitLine?: string;
}
