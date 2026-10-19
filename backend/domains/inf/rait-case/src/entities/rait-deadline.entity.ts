// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
