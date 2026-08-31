// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
