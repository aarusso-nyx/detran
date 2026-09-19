// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
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
