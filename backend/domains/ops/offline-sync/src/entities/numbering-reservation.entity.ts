// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
