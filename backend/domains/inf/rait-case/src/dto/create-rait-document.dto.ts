// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
export interface CreateRaitDocumentDto {
  case_id: string;
  kind: string;
  origin: string;
  storage_key: string;
  filename: string;
  content_hash: string;
  digitised_from_paper?: boolean;
  attached_at?: string;
  attached_by?: string | null;
}
