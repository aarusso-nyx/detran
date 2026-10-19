// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
