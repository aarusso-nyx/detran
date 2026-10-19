// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
export interface CreateRaitDraftDto {
  case_id: string;
  version: number;
  author_id: string;
  document_id?: string | null;
  content_hash: string;
  status?: string;
  submitted_at?: string | null;
  returned_at?: string | null;
  return_guidance?: string | null;
  return_count?: number;
}
