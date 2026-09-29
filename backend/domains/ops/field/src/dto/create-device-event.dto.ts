// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
export interface CreateDeviceEventDto {
  device_id: string;
  agent_id?: string | null;
  event_type: string;
  event_at?: string;
  location_json?: Record<string, unknown> | null;
  details_json?: Record<string, unknown> | null;
  location_geom?: unknown | null;
}
