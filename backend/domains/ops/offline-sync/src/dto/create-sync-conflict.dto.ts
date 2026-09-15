// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
