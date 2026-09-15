// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
export interface CreateSyncConflictDto {
  sync_queue_item_id: string;
  conflict_type: string;
  reason_code?: string;
  safe_message?: string;
  correlation_id?: string;
  local_hash?: string | null;
  server_hash?: string | null;
  retryable?: boolean;
  allowed_resolution_actions?: Record<string, unknown>;
  description: string;
  status?: string;
  resolved_by_user_ref?: string | null;
  resolved_at?: string | null;
  resolution_action?: string | null;
  resolution_details_json?: Record<string, unknown> | null;
}
