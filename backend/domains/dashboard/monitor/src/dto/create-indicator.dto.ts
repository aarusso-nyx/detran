// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface CreateIndicatorDto {
  code: string;
  block: string;
  kind: string;
  name: string;
  question: string;
  source_app: string;
  source_ref: string;
  threshold_rule: string;
  owner_actor: string;
  expected_action: string;
  classification?: string;
  latency_band: string;
  acceptable_latency_minutes?: number | null;
  unavailable_strategy?: string | null;
  projection?: string | null;
  connected?: boolean;
  clock_code?: string | null;
}
