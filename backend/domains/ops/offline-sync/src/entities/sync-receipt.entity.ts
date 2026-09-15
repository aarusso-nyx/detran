// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
