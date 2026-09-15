// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
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
