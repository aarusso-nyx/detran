// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
export interface RaitScheduleSlot {
  id: string;
  tenant_id: string;
  schedule_id: string;
  slot_on: string;
  availability: string;
  absence_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
