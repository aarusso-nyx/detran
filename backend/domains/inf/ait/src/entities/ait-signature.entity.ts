// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
