// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
