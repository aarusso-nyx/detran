// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
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
