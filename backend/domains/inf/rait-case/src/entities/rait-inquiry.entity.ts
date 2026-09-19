// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
