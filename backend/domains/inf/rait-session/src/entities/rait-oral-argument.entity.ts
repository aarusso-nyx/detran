// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
export interface RaitOralArgument {
  id: string;
  tenant_id: string;
  agenda_item_id: string;
  requested_by_party_id?: string | null;
  requested_at: string;
  granted?: boolean | null;
  denial_basis?: string | null;
  held_at?: string | null;
  duration_minutes?: number | null;
  created_at: string;
  updated_at?: string | null;
}
