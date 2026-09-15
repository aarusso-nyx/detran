// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
export interface RaitCommunication {
  id: string;
  tenant_id: string;
  case_id: string;
  decision_id?: string | null;
  channel: string;
  sent_at: string;
  effective_on?: string | null;
  next_deadline_on?: string | null;
  authority_appeal_notice: boolean;
  enclosed_document_ids?: Record<string, unknown> | null;
  content_ref: string;
  created_at: string;
  updated_at?: string | null;
}
