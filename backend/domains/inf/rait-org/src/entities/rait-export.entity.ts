// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface RaitExport {
  id: string;
  tenant_id: string;
  purpose: string;
  scope: Record<string, unknown>;
  requested_by: string;
  requested_at: string;
  row_count?: number | null;
  status: string;
  dpo_approved_by?: string | null;
  dpo_approved_at?: string | null;
  generated_at?: string | null;
  document_id?: string | null;
  content_hash?: string | null;
  created_at: string;
  updated_at?: string | null;
}
