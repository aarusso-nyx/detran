// Generated from BP-INF-AIT-001 v1.0.0 sha256:1b2717e37821dbaa07fe8909762b132a11e1f71514ca40a196fb04a8053d5e77
export interface CreateAitStatusHistoryDto {
  ait_id: string;
  status: string;
  changed_at?: string;
  user_ref?: string | null;
  system_name?: string | null;
  reason?: string | null;
  details_json?: Record<string, unknown> | null;
}
