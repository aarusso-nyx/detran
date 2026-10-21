// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
