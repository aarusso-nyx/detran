// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
