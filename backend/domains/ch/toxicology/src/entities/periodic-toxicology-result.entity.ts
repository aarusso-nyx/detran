// Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062
export interface PeriodicToxicologyResult {
  id: string;
  tenant_id: string;
  source_event_id: string;
  payload_sha256: string;
  patient_id: string;
  driver_cpf: string;
  category: string;
  result: string;
  collected_at: string;
  valid_until: string;
  occurred_at: string;
  laboratory_code: string;
  source_reference: string;
  driver_alert_status: string;
  received_at: string;
  created_at: string;
  updated_at?: string | null;
}
