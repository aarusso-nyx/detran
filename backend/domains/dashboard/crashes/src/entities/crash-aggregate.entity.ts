// Generated from BP-DASHBOARD-CRASHES-001 v1.0.0 sha256:45f272c2e89a665bb7a2cfecc671d0b26d136439df8f239f51adf116bd65b241
export interface CrashAggregate {
  id: string;
  tenant_id: string;
  period_start: string;
  municipality_code: string;
  severity: string;
  crash_count: number;
  last_event_id: string;
  event_schema_version: number;
  aggregate_version: number;
  created_at: string;
  updated_at?: string | null;
}
