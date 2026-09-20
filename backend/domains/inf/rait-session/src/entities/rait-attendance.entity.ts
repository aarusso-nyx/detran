// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
export interface RaitAttendance {
  id: string;
  tenant_id: string;
  session_id: string;
  member_id: string;
  present: boolean;
  is_chair: boolean;
  is_chair_substitute: boolean;
  arrived_at?: string | null;
  left_at?: string | null;
  absence_justified?: boolean | null;
  representation_block?: string | null;
  membership_kind?: string | null;
  mandate_starts_on_snapshot?: string | null;
  mandate_ends_on_snapshot?: string | null;
  institutional_seat_ref?: string | null;
  appointment_act_ref?: string | null;
  institutional_valid_from?: string | null;
  institutional_valid_to?: string | null;
  composition_snapshot_hash?: string | null;
  created_at: string;
  updated_at?: string | null;
}
