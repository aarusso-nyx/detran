// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
