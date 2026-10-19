// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
