// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
