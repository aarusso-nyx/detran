// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
