// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
export interface NumberingReservation {
  id: string;
  tenant_id: string;
  range_id: string;
  traffic_agency_id: string;
  agent_id: string;
  device_id: string;
  shift_id?: string | null;
  idempotency_key?: string | null;
  start_number: number;
  end_number: number;
  reserved_at: string;
  valid_until: string;
  status: string;
  reconciliation_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
