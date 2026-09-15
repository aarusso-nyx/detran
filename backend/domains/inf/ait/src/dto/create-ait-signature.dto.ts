// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
