// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
export interface CreateSessionHandoffDto {
  shift_id: string;
  from_agent_id: string;
  to_agent_id: string;
  handed_off_at: string;
  details_json?: Record<string, unknown> | null;
}
