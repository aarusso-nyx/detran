// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
export interface CreateRaitPendingContentDto {
  case_id: string;
  missing_items: Record<string, unknown>;
  due_on: string;
  opened_at?: string;
  opened_by: string;
  closed_at?: string | null;
  outcome?: string | null;
}
