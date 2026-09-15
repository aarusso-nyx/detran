// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
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
