// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
export interface RaitPriorityBasis {
  id: string;
  tenant_id: string;
  case_id: string;
  assessment_id: string;
  basis_code: string;
  verified_at: string;
  verified_by: string;
  source_kind: string;
  source_ref: string;
  document_id?: string | null;
  birth_date?: string | null;
  evidence_hash?: string | null;
  created_at: string;
  updated_at?: string | null;
}
