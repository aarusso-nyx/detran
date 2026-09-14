// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
export interface CreateRaitPendingContentDto {
  case_id: string;
  missing_items: Record<string, unknown>;
  due_on: string;
  opened_at?: string;
  opened_by: string;
  closed_at?: string | null;
  outcome?: string | null;
}
