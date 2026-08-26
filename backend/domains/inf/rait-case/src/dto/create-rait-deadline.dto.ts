// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
export interface CreateRaitDeadlineDto {
  case_id: string;
  timer_code: string;
  start_basis: string;
  started_on: string;
  raw_due_on: string;
  due_on: string;
  business_days?: boolean;
  extension_count?: number;
  satisfied_at?: string | null;
  suspended_by_act_id?: string | null;
  legal_basis: string;
}
