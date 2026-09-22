// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface CreateTransparencyAuditDto {
  period: string;
  checklist_json: Record<string, unknown>;
  result: string;
  audited_by: string;
  audited_at?: string;
  notes?: string | null;
}
