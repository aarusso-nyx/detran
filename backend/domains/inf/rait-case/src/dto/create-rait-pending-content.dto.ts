// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
export interface CreateRaitPendingContentDto {
  case_id: string;
  missing_items: Record<string, unknown>;
  due_on: string;
  opened_at?: string;
  opened_by: string;
  closed_at?: string | null;
  outcome?: string | null;
}
