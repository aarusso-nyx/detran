// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
export interface CreateRaitDecisionDto {
  case_id: string;
  circuit: number;
  decision_kind: string;
  grounds: string;
  decided_by: string;
  decided_at?: string;
  session_id?: string | null;
  signature_kind?: string | null;
  signature_ref?: string | null;
  published_at?: string | null;
}
