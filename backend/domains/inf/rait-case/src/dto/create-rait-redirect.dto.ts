// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
