// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
export interface FeedbackRequest {
  id: string;
  tenant_id: string;
  report_id: string;
  encounter_id: string;
  patient_id: string;
  professional_id: string;
  requested_by: string;
  legal_result_label: string;
  status: string;
  requested_at: string;
  scheduled_at?: string | null;
  completed_at?: string | null;
  completion_summary?: string | null;
  created_at: string;
  updated_at?: string | null;
}
