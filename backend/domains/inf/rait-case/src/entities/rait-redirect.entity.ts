// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
