// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
export interface CreateApproachDto {
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
}
