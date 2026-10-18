// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
