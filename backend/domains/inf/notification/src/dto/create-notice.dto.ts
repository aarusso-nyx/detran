// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
export interface CreateNoticeDto {
  infraction_id: string;
  case_id?: string | null;
  kind: string;
  addressee_kind: string;
  addressee_ref?: string | null;
  channel: string;
  issued_at: string;
  dispatched_at?: string | null;
  dispatched_on?: string | null;
  printed_deadline_on?: string | null;
  document_id?: string | null;
  status: string;
  supersedes_notice_id?: string | null;
}
