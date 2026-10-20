// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:852642f2217b56455f370f0d31299a708cd2582a04621d30461180596cf1de03
export interface CreateSessionHandoffDto {
  shift_id: string;
  from_agent_id: string;
  to_agent_id: string;
  handed_off_at: string;
  details_json?: Record<string, unknown> | null;
}
