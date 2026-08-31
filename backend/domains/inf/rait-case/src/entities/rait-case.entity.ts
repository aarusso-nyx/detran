// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:9d98d9786bc2f4b27bd75cb5516d4a00b6d74e520f3dbc52c39f33effb27f60e
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
  cetran_received_at?: string | null;
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
