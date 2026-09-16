// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
