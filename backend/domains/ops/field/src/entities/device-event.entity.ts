// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
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
