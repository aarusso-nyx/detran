// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
