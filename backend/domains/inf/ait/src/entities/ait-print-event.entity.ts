// Generated from BP-INF-AIT-001 v1.0.0 sha256:ef69813e9ad97641c04b7bbbdb8110fe97446523d552fdf17da429d55de0b510
export interface AitPrintEvent {
  id: string;
  tenant_id: string;
  ait_id: string;
  event_type: string;
  event_at: string;
  device_id?: string | null;
  printer_identifier?: string | null;
  receipt_hash?: string | null;
  failure_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
