// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
export interface RaitSchedule {
  id: string;
  tenant_id: string;
  pool_id: string;
  member_id: string;
  kind: string;
  period_start: string;
  period_end: string;
  availability: string;
  wip_limit?: number | null;
  absence_reason?: string | null;
  published_at?: string | null;
  published_by?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
