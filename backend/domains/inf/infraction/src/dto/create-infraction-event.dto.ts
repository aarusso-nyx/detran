// Generated from BP-INF-INFRACTION-001 v1.1.2 sha256:59e421dbbb90b291b45408217601e9d6a86b992d9c75c00e5f73b17c5b2e21dd
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
