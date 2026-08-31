// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
