// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
  answered_on?: string | null;
  outcome?: string | null;
  created_at: string;
  updated_at?: string | null;
}
