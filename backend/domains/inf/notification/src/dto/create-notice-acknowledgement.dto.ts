// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
export interface CreateNoticeAcknowledgementDto {
  notice_id: string;
  effective_on: string;
  fictitious: boolean;
  evidence_kind: string;
  evidence_ref?: string | null;
  registered_at: string;
}
