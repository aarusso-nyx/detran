// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
export interface CreateCustodyEventDto {
  evidence_id: string;
  event_type: string;
  event_at?: string;
  user_ref?: string | null;
  system_name?: string | null;
  details_json?: Record<string, unknown> | null;
}
