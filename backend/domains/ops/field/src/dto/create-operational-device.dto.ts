// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
