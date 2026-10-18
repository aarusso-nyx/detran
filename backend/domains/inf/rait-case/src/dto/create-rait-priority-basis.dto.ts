// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
export interface CreateRaitPriorityBasisDto {
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
}
