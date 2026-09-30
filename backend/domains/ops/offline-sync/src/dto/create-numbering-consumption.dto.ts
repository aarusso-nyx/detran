// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
export interface CreateNumberingConsumptionDto {
  reservation_id: string;
  range_id: string;
  number: number;
  local_entity_id?: string | null;
  idempotency_key?: string | null;
  server_entity_id?: string | null;
  finalized_at?: string | null;
  reconciled_at?: string;
  status?: string;
  details_json?: Record<string, unknown> | null;
}
