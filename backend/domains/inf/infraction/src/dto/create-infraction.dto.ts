// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
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
