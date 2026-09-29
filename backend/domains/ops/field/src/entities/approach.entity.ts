// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
