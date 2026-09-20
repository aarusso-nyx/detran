// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
export interface CreateRaitCaseDto {
  ait_id: string;
  origin_case_id?: string | null;
  protocol_number: string;
  instance: string;
  circuit: number;
  state?: string;
  intake_channel: string;
  admitted_at?: string | null;
  judge_body_received_at?: string | null;
  judge_body_received_on?: string | null;
  cetran_received_at?: string | null;
  cetran_received_on?: string | null;
  remitted_at?: string | null;
  decided_at?: string | null;
  communicated_at?: string | null;
  closed_at?: string | null;
  suspensive_effect?: boolean;
  archived?: boolean;
  non_admission_reason?: string | null;
  withdrawal_document_id?: string | null;
  last_movement_at?: string;
  pending_completion?: boolean;
  unit_id?: string | null;
  agency_jurisdiction_id?: string | null;
  version?: number;
}
