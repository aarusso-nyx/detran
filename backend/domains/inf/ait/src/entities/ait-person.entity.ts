// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
