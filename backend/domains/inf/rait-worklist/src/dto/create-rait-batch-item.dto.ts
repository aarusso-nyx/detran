// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
export interface CreateRaitBatchItemDto {
  batch_id: string;
  case_id: string;
  position: number;
  member_id?: string | null;
  claim_due_on?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  decline_kind?: string | null;
}
