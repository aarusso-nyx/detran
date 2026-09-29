// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
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
