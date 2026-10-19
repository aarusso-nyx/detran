// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
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
