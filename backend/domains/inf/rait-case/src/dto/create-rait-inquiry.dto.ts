// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
export interface CreateRaitInquiryDto {
  case_id: string;
  addressee: string;
  subject: string;
  requested_at?: string;
  requested_by: string;
  due_on: string;
  extension_count?: number;
  answered_at?: string | null;
  answered_on?: string | null;
  outcome?: string | null;
}
