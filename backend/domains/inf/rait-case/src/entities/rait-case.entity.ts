// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
export interface RaitCase {
  id: string;
  tenant_id: string;
  ait_id: string;
  origin_case_id?: string | null;
  protocol_number: string;
  instance: string;
  circuit: number;
  state: string;
  intake_channel: string;
  protocolled_at: string;
  admitted_at?: string | null;
  judge_body_received_at?: string | null;
  remitted_at?: string | null;
  decided_at?: string | null;
  communicated_at?: string | null;
  closed_at?: string | null;
  suspensive_effect: boolean;
  archived: boolean;
  non_admission_reason?: string | null;
  withdrawal_document_id?: string | null;
  last_movement_at: string;
  pending_completion: boolean;
  created_at: string;
  updated_at?: string | null;
}
