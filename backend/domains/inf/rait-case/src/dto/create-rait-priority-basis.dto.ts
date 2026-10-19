// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
