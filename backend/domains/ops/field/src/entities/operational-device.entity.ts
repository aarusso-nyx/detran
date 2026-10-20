// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
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
