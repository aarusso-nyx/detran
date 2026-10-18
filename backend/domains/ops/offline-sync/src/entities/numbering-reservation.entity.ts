// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
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
