// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
