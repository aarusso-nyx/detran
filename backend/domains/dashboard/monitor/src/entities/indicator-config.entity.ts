// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
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
