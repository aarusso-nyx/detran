// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
