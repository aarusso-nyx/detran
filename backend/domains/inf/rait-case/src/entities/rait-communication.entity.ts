// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
