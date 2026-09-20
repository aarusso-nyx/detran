// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
