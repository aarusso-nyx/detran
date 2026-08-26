// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
export interface RaitInquiry {
  id: string;
  tenant_id: string;
  case_id: string;
  addressee: string;
  subject: string;
  requested_at: string;
  requested_by: string;
  due_on: string;
  extension_count: number;
  answered_at?: string | null;
  outcome?: string | null;
  created_at: string;
  updated_at?: string | null;
}
