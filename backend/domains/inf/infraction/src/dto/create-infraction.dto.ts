// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
export interface CreateInfractionDto {
  ait_id: string;
  state?: string;
  substate?: string | null;
  subject_kind?: string;
  suspensive_effect?: boolean;
  paid?: boolean;
  payment_tier?: string;
  points_registered?: boolean;
  closure_motive?: string | null;
  risk_flag?: string;
  committed_on: string;
  flagrant: boolean;
  known_on?: string | null;
  state_changed_at: string;
  last_transition_id?: unknown | null;
  version?: number;
}
