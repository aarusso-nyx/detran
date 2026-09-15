// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
export interface AitCancelRequestEvent {
  id: string;
  tenant_id: string;
  cancel_request_id: string;
  event_type: string;
  event_at: string;
  actor_user_ref?: string | null;
  decision?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
