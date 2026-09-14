// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
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
