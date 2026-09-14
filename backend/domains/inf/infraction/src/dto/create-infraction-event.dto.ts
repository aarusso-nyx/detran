// Generated from BP-INF-INFRACTION-001 v1.1.1 sha256:c9e1dec5067f8324003780a279b646761b2298bf7712019b3023acdf50746e4c
export interface CreateInfractionEventDto {
  infraction_id: string;
  transition_id?: unknown | null;
  rule_ref?: unknown | null;
  from_state?: string | null;
  to_state?: string | null;
  from_substate?: string | null;
  to_substate?: string | null;
  trigger_kind: string;
  trigger_code: string;
  event_code: string;
  occurred_at: string;
  actor_id?: string | null;
  actor_kind: string;
  payload: Record<string, unknown>;
  outbox_id?: string | null;
}
