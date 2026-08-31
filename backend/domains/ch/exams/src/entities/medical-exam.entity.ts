// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:4768197f351ea702628ed5198543624eb79b54621bfc8fb4c6383ecc414b17b9
export interface MedicalExam {
  id: string;
  tenant_id: string;
  encounter_id: string;
  professional_id: string;
  performed_at: string;
  statutory_valid_until: string;
  valid_until: string;
  inaptitude_until?: string | null;
  validity_reduction_reason?: string | null;
  data: Record<string, unknown>;
  result: string;
  created_at: string;
  updated_at?: string | null;
}
