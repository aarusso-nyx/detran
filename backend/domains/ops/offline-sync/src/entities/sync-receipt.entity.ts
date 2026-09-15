// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
export interface SyncReceipt {
  id: string;
  tenant_id: string;
  sync_queue_item_id: string;
  idempotency_key: string;
  entity_type: string;
  local_entity_id: string;
  server_entity_id?: string | null;
  accepted_hash: string;
  status: string;
  reason_code?: string | null;
  applied_at?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
