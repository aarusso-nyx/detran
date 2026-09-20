// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
export interface CreateRaitOralArgumentDto {
  agenda_item_id: string;
  requested_by_party_id?: string | null;
  requested_at?: string;
  granted?: boolean | null;
  denial_basis?: string | null;
  held_at?: string | null;
  duration_minutes?: number | null;
}
