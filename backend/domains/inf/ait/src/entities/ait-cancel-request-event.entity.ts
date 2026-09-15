// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
