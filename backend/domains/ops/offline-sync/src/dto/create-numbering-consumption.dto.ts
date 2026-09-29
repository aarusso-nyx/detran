// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
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
