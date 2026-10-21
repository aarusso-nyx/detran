// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
export interface RaitDraft {
  id: string;
  tenant_id: string;
  case_id: string;
  version: number;
  author_id: string;
  document_id?: string | null;
  content_hash: string;
  status: string;
  submitted_at?: string | null;
  returned_at?: string | null;
  return_guidance?: string | null;
  return_count: number;
  created_at: string;
  updated_at?: string | null;
}
