// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
export interface CreateShiftDto {
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
  status?: string;
  offline_periods_count?: number;
  start_location_geom?: unknown | null;
  end_location_geom?: unknown | null;
}
