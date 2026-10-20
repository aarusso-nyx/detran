// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
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
