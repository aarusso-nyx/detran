// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
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
