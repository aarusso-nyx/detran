// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
export interface BiometricCheck {
  id: string;
  tenant_id: string;
  appointment_id?: string | null;
  encounter_id?: string | null;
  clinic_id: string;
  station_id: string;
  subject_patient_id?: string | null;
  subject_professional_id?: string | null;
  performed_at: string;
  kind: string;
  modality: string;
  score?: number | null;
  lfd_score?: number | null;
  passed: boolean;
  evidence_document_id: string;
  evidence_sha256: string;
  reason?: string | null;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
