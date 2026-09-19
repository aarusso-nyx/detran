// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
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
