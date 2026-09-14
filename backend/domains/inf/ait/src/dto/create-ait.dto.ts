// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
export interface CreateAitDto {
  traffic_agency_id: string;
  executing_agency_id?: string | null;
  ait_number: string;
  series?: string;
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
  had_approach?: boolean;
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
  current_status?: string;
  content_hash?: string | null;
  system_signature_ref?: string | null;
  receipt_protocol?: string | null;
  location_geom?: unknown | null;
}
