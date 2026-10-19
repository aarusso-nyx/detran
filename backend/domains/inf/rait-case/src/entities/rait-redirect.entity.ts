// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
export interface RaitRedirect {
  id: string;
  tenant_id: string;
  case_id?: string | null;
  direction: string;
  reason: string;
  protocol_number: string;
  ait_number?: string | null;
  counterpart_agency: string;
  counterpart_renainf_code?: string | null;
  origin_protocolled_on?: string | null;
  deadline_restored: boolean;
  receipt_document_id?: string | null;
  redirected_at: string;
  redirected_by: string;
  created_at: string;
  updated_at?: string | null;
}
