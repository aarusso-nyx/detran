// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface RaitJetonSheet {
  id: string;
  tenant_id: string;
  judging_body: string;
  period_start: string;
  period_end: string;
  state: string;
  generated_at: string;
  generated_by?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  homologated_at?: string | null;
  homologated_by?: string | null;
  sent_at?: string | null;
  document_id?: string | null;
  source_pending: boolean;
  created_at: string;
  updated_at?: string | null;
}
