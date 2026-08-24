// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
export interface Ait {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  executing_agency_id?: string | null;
  ait_number: string;
  series: string;
  agent_id: string;
  shift_id: string;
  operation_id?: string | null;
  device_id: string;
  framing_id: string;
  catalog_id: string;
  infraction_at: string;
  issued_at: string;
  issuance_mode: string;
  constatation_type: string;
  had_approach: boolean;
  no_approach_reason?: string | null;
  location_description: string;
  location_json?: Record<string, unknown> | null;
  gps_accuracy_m?: number | null;
  municipality_code?: string | null;
  uf: string;
  road?: string | null;
  km?: number | null;
  direction?: string | null;
  mandatory_observation?: string | null;
  complementary_observation?: string | null;
  current_status: string;
  content_hash?: string | null;
  system_signature_ref?: string | null;
  receipt_protocol?: string | null;
  location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
