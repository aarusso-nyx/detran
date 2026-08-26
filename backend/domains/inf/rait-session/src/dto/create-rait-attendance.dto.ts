// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
