// Generated from BP-DASH-MONITOR-001 v1.1.0 sha256:db365ada798a2115de6d57a3153f93d3657948f6562dab9927f4e35f0a8c765a
export interface TransparencyAudit {
  id: string;
  tenant_id: string;
  period: string;
  checklist_json: Record<string, unknown>;
  result: string;
  audited_by: string;
  audited_at: string;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}
