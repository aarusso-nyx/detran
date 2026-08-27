// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
