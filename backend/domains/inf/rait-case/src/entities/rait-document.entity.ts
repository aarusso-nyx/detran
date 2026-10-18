// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
