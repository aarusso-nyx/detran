// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
