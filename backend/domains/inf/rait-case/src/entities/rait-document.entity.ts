// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
