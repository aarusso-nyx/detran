// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
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
