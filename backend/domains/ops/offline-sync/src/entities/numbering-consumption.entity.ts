// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
export interface NumberingConsumption {
  id: string;
  tenant_id: string;
  reservation_id: string;
  range_id: string;
  number: number;
  local_entity_id?: string | null;
  idempotency_key?: string | null;
  server_entity_id?: string | null;
  finalized_at?: string | null;
  reconciled_at: string;
  status: string;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
