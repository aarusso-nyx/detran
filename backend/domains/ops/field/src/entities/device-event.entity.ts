// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
export interface DeviceEvent {
  id: string;
  tenant_id: string;
  device_id: string;
  agent_id?: string | null;
  event_type: string;
  event_at: string;
  location_json?: Record<string, unknown> | null;
  details_json?: Record<string, unknown> | null;
  location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
