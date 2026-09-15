// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
export interface SessionHandoff {
  id: string;
  tenant_id: string;
  shift_id: string;
  from_agent_id: string;
  to_agent_id: string;
  handed_off_at: string;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
