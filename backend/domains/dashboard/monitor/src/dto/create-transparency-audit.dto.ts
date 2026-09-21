// Generated from BP-DASH-MONITOR-001 v1.0.0 sha256:f6f02498282fa6757196ac8b711a05e41a930f7e3980a3b9e96f62a2438e24ab
export interface CreateTransparencyAuditDto {
  period: string;
  checklist_json: Record<string, unknown>;
  result: string;
  audited_by: string;
  audited_at?: string;
  notes?: string | null;
}
