// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
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
