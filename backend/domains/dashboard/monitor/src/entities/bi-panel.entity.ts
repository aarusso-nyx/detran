// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface BiPanel {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  visibility_profile: string;
  config_json: Record<string, unknown>;
  status: string;
  published_at?: string | null;
  published_by?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
