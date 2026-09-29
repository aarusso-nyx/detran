// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:ff9d218be3314b511ef2cdab143c94785c99ffe446405136e001f85f8978c1ad
export interface CreateNumberingReservationDto {
  range_id: string;
  traffic_agency_id: string;
  agent_id: string;
  device_id: string;
  shift_id?: string | null;
  idempotency_key?: string | null;
  start_number: number;
  end_number: number;
  reserved_at?: string;
  valid_until: string;
  status?: string;
  reconciliation_json?: Record<string, unknown> | null;
}
