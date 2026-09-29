// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
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
