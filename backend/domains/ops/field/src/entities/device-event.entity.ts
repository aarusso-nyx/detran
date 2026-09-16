// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
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
