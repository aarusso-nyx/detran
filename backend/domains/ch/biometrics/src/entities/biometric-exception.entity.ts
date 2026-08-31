// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
export interface BiometricException {
  id: string;
  tenant_id: string;
  appointment_id?: string | null;
  encounter_id?: string | null;
  clinic_id: string;
  station_id: string;
  biometric_check_id: string;
  scope: string;
  requested_by: string;
  reason: string;
  justification?: string | null;
  attachment_document_ids: Record<string, unknown>;
  status: string;
  approved_by?: string | null;
  approved_at?: string | null;
  expires_at: string;
  created_at: string;
  updated_at?: string | null;
}
