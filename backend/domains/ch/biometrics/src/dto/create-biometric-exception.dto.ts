// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
export interface CreateBiometricExceptionDto {
  appointment_id?: string | null;
  encounter_id?: string | null;
  clinic_id: string;
  station_id: string;
  biometric_check_id: string;
  scope: string;
  reason: string;
  justification?: string | null;
  attachment_document_ids?: Record<string, unknown>;
}
