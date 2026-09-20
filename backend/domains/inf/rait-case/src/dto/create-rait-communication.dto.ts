// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
