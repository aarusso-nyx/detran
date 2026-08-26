// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
export interface RaitVote {
  id: string;
  tenant_id: string;
  agenda_item_id: string;
  member_id: string;
  vote: string;
  casting_vote: boolean;
  cast_at: string;
  created_at: string;
  updated_at?: string | null;
}
