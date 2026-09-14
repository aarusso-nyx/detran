// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
export interface SyncConflict {
  id: string;
  tenant_id: string;
  sync_queue_item_id: string;
  conflict_type: string;
  reason_code: string;
  safe_message: string;
  correlation_id: string;
  local_hash?: string | null;
  server_hash?: string | null;
  retryable: boolean;
  allowed_resolution_actions: Record<string, unknown>;
  description: string;
  status: string;
  resolved_by_user_ref?: string | null;
  resolved_at?: string | null;
  resolution_action?: string | null;
  resolution_details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
