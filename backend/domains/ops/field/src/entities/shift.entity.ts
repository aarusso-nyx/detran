// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
