// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
export interface OperationalDevice {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  hardware_identifier_hash: string;
  model?: string | null;
  manufacturer?: string | null;
  os_name: string;
  os_version?: string | null;
  status: string;
  app_version?: string | null;
  last_seen_at?: string | null;
  last_location_json?: Record<string, unknown> | null;
  tamper_flag: boolean;
  last_location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
