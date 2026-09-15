// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
export interface AitStatusHistory {
  id: string;
  tenant_id: string;
  ait_id: string;
  status: string;
  changed_at: string;
  user_ref?: string | null;
  system_name?: string | null;
  reason?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
