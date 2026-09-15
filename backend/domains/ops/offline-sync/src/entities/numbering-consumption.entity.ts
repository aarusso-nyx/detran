// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
export interface NumberingConsumption {
  id: string;
  tenant_id: string;
  reservation_id: string;
  range_id: string;
  number: number;
  local_entity_id: string;
  idempotency_key: string;
  server_entity_id: string;
  finalized_at: string;
  reconciled_at: string;
  status: string;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
