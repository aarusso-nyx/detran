// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
export interface MeasureStatusHistory {
  id: string;
  tenant_id: string;
  measure_id: string;
  status: string;
  changed_at: string;
  user_ref?: string | null;
  reason?: string | null;
  details_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
