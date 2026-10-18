// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
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
