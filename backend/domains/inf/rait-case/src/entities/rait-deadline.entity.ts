// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
export interface RaitDeadline {
  id: string;
  tenant_id: string;
  case_id: string;
  timer_code: string;
  start_basis: string;
  started_on: string;
  raw_due_on: string;
  due_on: string;
  business_days: boolean;
  extension_count: number;
  satisfied_at?: string | null;
  suspended_by_act_id?: string | null;
  legal_basis: string;
  created_at: string;
  updated_at?: string | null;
}
