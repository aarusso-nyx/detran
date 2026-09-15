// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
