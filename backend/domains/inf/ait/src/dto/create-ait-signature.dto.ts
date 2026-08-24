// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
export interface CreateAitSignatureDto {
  ait_id: string;
  person_id?: string | null;
  signature_type: string;
  signature_evidence_id?: string | null;
  signed_at?: string;
  location_json?: Record<string, unknown> | null;
  refusal_or_impossibility_reason?: string | null;
  location_geom?: unknown | null;
}
