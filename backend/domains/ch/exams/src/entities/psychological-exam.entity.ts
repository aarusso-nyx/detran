// Generated from BP-CH-EXAMS-001 v1.1.0 sha256:bc8c0fd1f8e0a5a9684ebb7d2165df727ebdb3730cb7cf8f3bb8b106f2990fa9
export interface PsychologicalExam {
  id: string;
  tenant_id: string;
  encounter_id: string;
  professional_id: string;
  instrument_id: string;
  performed_at: string;
  valid_until?: string | null;
  inaptitude_until?: string | null;
  validity_reduction_reason?: string | null;
  data: Record<string, unknown>;
  result: string;
  created_at: string;
  updated_at?: string | null;
}
