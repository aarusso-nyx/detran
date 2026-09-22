// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
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
