// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
export interface CreateRaitAttendanceDto {
  session_id: string;
  member_id: string;
  present?: boolean;
  is_chair?: boolean;
  is_chair_substitute?: boolean;
  arrived_at?: string | null;
  left_at?: string | null;
  absence_justified?: boolean | null;
}
