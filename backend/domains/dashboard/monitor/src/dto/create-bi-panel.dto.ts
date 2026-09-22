// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateBiPanelDto {
  name: string;
  description?: string | null;
  visibility_profile: string;
  config_json: Record<string, unknown>;
  status?: string;
  published_at?: string | null;
  published_by?: string | null;
  version?: number;
}
