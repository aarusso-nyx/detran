// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
