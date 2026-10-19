// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
export interface RaitPendingContent {
  id: string;
  tenant_id: string;
  case_id: string;
  missing_items: Record<string, unknown>;
  due_on: string;
  opened_at: string;
  opened_by: string;
  closed_at?: string | null;
  outcome?: string | null;
  created_at: string;
  updated_at?: string | null;
}
