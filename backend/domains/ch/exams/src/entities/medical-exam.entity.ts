// Generated from BP-CH-EXAMS-001 v1.0.0 sha256:b8585266a2e5ca4734d9b60ec5bade83fc01a1b209d3b3dbd1729a16a6b03734
export interface MedicalExam {
  id: string;
  tenant_id: string;
  encounter_id: string;
  professional_id: string;
  performed_at: string;
  statutory_valid_until: string;
  valid_until: string;
  validity_reduction_reason?: string | null;
  data: Record<string, unknown>;
  result: string;
  created_at: string;
  updated_at?: string | null;
}
