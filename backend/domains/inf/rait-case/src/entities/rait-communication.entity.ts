// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
