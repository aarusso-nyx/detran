// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
export interface CreateRaitExportDto {
  purpose: string;
  scope?: Record<string, unknown>;
  requested_by: string;
  requested_at?: string;
  row_count?: number | null;
  status?: string;
  dpo_approved_by?: string | null;
  dpo_approved_at?: string | null;
  generated_at?: string | null;
  document_id?: string | null;
  content_hash?: string | null;
}
