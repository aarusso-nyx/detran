// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
export interface CreateRaitPendingContentDto {
  case_id: string;
  missing_items: Record<string, unknown>;
  due_on: string;
  opened_at?: string;
  opened_by: string;
  closed_at?: string | null;
  outcome?: string | null;
}
