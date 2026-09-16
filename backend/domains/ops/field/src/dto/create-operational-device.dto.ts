// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
export interface CreateOperationalDeviceDto {
  traffic_agency_id: string;
  hardware_identifier_hash: string;
  model?: string | null;
  manufacturer?: string | null;
  os_name: string;
  os_version?: string | null;
  status?: string;
  app_version?: string | null;
  last_seen_at?: string | null;
  last_location_json?: Record<string, unknown> | null;
  tamper_flag?: boolean;
  last_location_geom?: unknown | null;
}
