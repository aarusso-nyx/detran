// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
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
