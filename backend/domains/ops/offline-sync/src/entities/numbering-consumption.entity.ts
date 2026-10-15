// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
