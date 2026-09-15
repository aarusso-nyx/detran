// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
  version?: number;
  speed_measurement_id?: string | null;
  content_hash?: string | null;
  system_signature_ref?: string | null;
  receipt_protocol?: string | null;
  location_geom?: unknown | null;
}
