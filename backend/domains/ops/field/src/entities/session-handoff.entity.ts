// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
export interface SessionHandoff {
  id: string;
  tenant_id: string;
  shift_id: string;
  from_agent_id: string;
  to_agent_id: string;
  handed_off_at: string;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
