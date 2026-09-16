// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
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
