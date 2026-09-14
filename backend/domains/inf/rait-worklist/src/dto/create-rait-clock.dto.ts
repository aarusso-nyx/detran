// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
export interface CreateRaitClockDto {
  case_id: string;
  clock_code: string;
  started_on: string;
  ceiling_on: string;
  flag?: string;
  flag_changed_at?: string;
  last_reset_at?: string | null;
  legal_basis: string;
}
