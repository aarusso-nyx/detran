// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
export interface AlcoholRefusal {
  id: string;
  tenant_id: string;
  procedure_id: string;
  refused_at: string;
  kind: string;
  refusal_description: string;
  witness_person_id?: string | null;
  evidence_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
