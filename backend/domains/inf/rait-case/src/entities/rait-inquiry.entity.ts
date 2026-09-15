// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
