// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
