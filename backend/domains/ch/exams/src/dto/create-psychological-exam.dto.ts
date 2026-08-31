// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
export interface CreatePsychologicalExamDto {
  encounter_id: string;
  professional_id: string;
  instrument_id: string;
  performed_at?: string;
  valid_until?: string | null;
  validity_reduction_reason?: string | null;
  data: Record<string, unknown>;
  result: string;
}
