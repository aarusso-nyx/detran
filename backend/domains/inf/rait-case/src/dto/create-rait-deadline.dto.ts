// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
