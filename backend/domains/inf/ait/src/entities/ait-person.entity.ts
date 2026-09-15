// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
export interface AitPerson {
  id: string;
  tenant_id: string;
  ait_id: string;
  person_id: string;
  role: string;
  identified_by: string;
  external_query_id?: string | null;
  signed: boolean;
  refused_signature: boolean;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}
