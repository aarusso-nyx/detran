// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
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
