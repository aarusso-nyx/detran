// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
