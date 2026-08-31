// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
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
