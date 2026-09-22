// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface CreateDutyDto {
  code: string;
  line_no?: number | null;
  title: string;
  source_ref: string;
  periodicity: string;
  deadline_rule?: string | null;
  deadline_kind: string;
  consequence: string;
  rule_ref: string;
  scope: string;
  owner_role?: string;
  owner_actor?: string | null;
  indicator_code?: string | null;
  mvp?: boolean;
}
