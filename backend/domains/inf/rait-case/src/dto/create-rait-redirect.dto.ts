// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
