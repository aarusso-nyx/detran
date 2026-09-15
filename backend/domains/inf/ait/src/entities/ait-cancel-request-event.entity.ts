// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
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
