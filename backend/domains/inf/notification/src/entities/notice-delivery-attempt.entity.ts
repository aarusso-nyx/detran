// Generated from BP-INF-NOTIFICATION-001 v1.1.1 sha256:4c103efb85b586bbe1d79e0fc7367ae2e566e53d551fa0e41fd4635207283be6
export interface NoticeDeliveryAttempt {
  id: string;
  tenant_id: string;
  notice_id: string;
  channel: string;
  attempted_at: string;
  outcome: string;
  provider_ref?: string | null;
  error_code?: string | null;
  outbox_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
