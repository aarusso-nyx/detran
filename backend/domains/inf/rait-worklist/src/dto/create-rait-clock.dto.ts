// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
