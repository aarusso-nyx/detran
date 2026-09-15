// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
