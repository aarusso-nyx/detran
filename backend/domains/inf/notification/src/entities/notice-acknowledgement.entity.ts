// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
export interface NoticeAcknowledgement {
  id: string;
  tenant_id: string;
  notice_id: string;
  effective_on: string;
  fictitious: boolean;
  evidence_kind: string;
  evidence_ref?: string | null;
  registered_at: string;
  created_at: string;
  updated_at?: string | null;
}
