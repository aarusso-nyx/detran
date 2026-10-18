// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
  judge_body_received_on?: string | null;
  cetran_received_at?: string | null;
  cetran_received_on?: string | null;
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
  legal_priority?: string | null;
  unit_id?: string | null;
  agency_jurisdiction_id?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
