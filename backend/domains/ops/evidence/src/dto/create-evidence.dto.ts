// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
export interface CreateEvidenceDto {
  traffic_agency_id: string;
  evidence_type: string;
  origin: string;
  storage_uri: string;
  mime_type: string;
  size_bytes: number;
  hash_algorithm: string;
  hash_value: string;
  captured_by_user_ref?: string | null;
  agent_id?: string | null;
  device_id?: string | null;
  captured_at: string;
  location_json?: Record<string, unknown> | null;
  status?: string;
  metadata_json?: Record<string, unknown> | null;
  location_geom?: unknown | null;
}
