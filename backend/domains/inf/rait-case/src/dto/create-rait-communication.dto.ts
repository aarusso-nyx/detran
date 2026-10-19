// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
export interface CreateRaitCommunicationDto {
  case_id: string;
  decision_id?: string | null;
  channel: string;
  sent_at?: string;
  effective_on?: string | null;
  next_deadline_on?: string | null;
  authority_appeal_notice?: boolean;
  enclosed_document_ids?: Record<string, unknown> | null;
  content_ref: string;
}
