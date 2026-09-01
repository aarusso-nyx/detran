// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
export interface CreateJuntaCaseDto {
  encounter_id: string;
  applicant_patient_id: string;
  track: string;
  reason_code: string;
  reason_detail?: string | null;
  result_known_at: string;
  requested_at: string;
}
