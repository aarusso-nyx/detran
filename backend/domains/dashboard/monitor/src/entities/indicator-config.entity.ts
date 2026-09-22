// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface IndicatorConfig {
  id: string;
  tenant_id: string;
  indicator_code: string;
  code: string;
  name: string;
  description?: string | null;
  formula: string;
  granularity: string;
  threshold_json?: Record<string, unknown> | null;
  acceptable_latency_minutes?: number | null;
  status: string;
  published_at?: string | null;
  published_by?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
