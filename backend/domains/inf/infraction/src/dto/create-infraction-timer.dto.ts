// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
export interface CreateInfractionTimerDto {
  infraction_id: string;
  timer_code: string;
  instance?: string | null;
  start_basis: string;
  started_on: string;
  raw_due_on: string;
  due_on: string;
  ceiling_on?: string | null;
  business_days?: boolean;
  status: string;
  satisfied_at?: string | null;
  expired_at?: string | null;
  cancel_reason?: string | null;
  suspended_by_act_id?: string | null;
  suspended_days?: number;
  extension_count?: number;
  legal_basis: string;
}
