// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
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
