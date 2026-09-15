// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
export interface CreateRaitScheduleDto {
  pool_id: string;
  member_id: string;
  kind: string;
  period_start: string;
  period_end: string;
  availability?: string;
  wip_limit?: number | null;
  absence_reason?: string | null;
  published_at?: string | null;
  published_by?: string | null;
}
