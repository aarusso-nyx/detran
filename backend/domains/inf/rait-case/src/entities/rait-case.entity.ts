// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
