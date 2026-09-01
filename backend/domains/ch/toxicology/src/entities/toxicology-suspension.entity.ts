// Generated from BP-CH-TOXICOLOGY-001 v1.0.0 sha256:9bd4b4e46865f6ee6a771bb9c561b1dddfdf2c684b8dc7b2d45a1fb3fbcb5062
export interface ToxicologySuspension {
  id: string;
  tenant_id: string;
  patient_id: string;
  source_positive_result_id: string;
  starts_at: string;
  ends_at: string;
  status: string;
  released_by_result_id?: string | null;
  released_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
