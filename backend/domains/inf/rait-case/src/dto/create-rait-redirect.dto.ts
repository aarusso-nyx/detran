// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
export interface CreateRaitRedirectDto {
  case_id?: string | null;
  direction: string;
  reason: string;
  protocol_number: string;
  ait_number?: string | null;
  counterpart_agency: string;
  counterpart_renainf_code?: string | null;
  origin_protocolled_on?: string | null;
  deadline_restored?: boolean;
  receipt_document_id?: string | null;
  redirected_at?: string;
  redirected_by: string;
}
