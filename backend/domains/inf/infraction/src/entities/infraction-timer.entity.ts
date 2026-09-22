// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
export interface InfractionTimer {
  id: string;
  tenant_id: string;
  infraction_id: string;
  timer_code: string;
  instance?: string | null;
  start_basis: string;
  started_on: string;
  raw_due_on: string;
  due_on: string;
  ceiling_on?: string | null;
  business_days: boolean;
  status: string;
  satisfied_at?: string | null;
  expired_at?: string | null;
  cancel_reason?: string | null;
  suspended_by_act_id?: string | null;
  suspended_days: number;
  extension_count: number;
  legal_basis: string;
  created_at: string;
  updated_at?: string | null;
}
