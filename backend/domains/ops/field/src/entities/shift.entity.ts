// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
export interface Shift {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  agent_id: string;
  device_id: string;
  operational_unit_id?: string | null;
  team_id?: string | null;
  patrol_vehicle_id?: string | null;
  operation_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  start_location_json?: Record<string, unknown> | null;
  end_location_json?: Record<string, unknown> | null;
  status: string;
  offline_periods_count: number;
  start_location_geom?: unknown | null;
  end_location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
