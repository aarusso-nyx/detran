// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
export interface RaitDocument {
  id: string;
  tenant_id: string;
  case_id: string;
  kind: string;
  origin: string;
  storage_key: string;
  filename: string;
  content_hash: string;
  digitised_from_paper: boolean;
  attached_at: string;
  attached_by?: string | null;
  created_at: string;
  updated_at?: string | null;
}
