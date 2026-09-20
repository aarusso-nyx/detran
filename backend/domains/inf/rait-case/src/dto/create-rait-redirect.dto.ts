// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
