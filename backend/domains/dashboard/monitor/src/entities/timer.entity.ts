// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface Timer {
  id: string;
  tenant_id: string;
  owner_kind: string;
  owner_id: string;
  code: string;
  started_at: string;
  due_at?: string | null;
  status: string;
  fired_at?: string | null;
  satisfied_at?: string | null;
  cancelled_at?: string | null;
  reason?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
