// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
export interface AitSignature {
  id: string;
  tenant_id: string;
  ait_id: string;
  person_id?: string | null;
  signature_type: string;
  signature_evidence_id?: string | null;
  signed_at: string;
  location_json?: Record<string, unknown> | null;
  refusal_or_impossibility_reason?: string | null;
  location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
