// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
