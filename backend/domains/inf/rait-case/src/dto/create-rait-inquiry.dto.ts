// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
export interface CreateRaitInquiryDto {
  case_id: string;
  addressee: string;
  subject: string;
  requested_at?: string;
  requested_by: string;
  due_on: string;
  extension_count?: number;
  answered_at?: string | null;
  outcome?: string | null;
}
