// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
export interface Approach {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  shift_id: string;
  operation_id?: string | null;
  agent_id: string;
  approached_at: string;
  location_json?: Record<string, unknown> | null;
  approach_type: string;
  result: string;
  notes?: string | null;
  location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
