// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
export interface JuntaAppeal {
  id: string;
  tenant_id: string;
  case_id: string;
  source_decision_id: string;
  applicant_patient_id: string;
  result_known_at: string;
  filed_at: string;
  filing_deadline_at: string;
  forwarded_at?: string | null;
  forwarding_deadline_rule: string;
  forwarding_deadline_at?: string | null;
  status: string;
  filed_by: string;
  created_at: string;
  updated_at?: string | null;
}
