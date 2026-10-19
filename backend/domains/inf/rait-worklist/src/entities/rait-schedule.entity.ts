// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
