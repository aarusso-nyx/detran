// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
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
