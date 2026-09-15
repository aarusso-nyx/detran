// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.0 sha256:ddd770d620f969774d0560bb02a8ebae3a43c42b4340a4092a1a7828963820a5
export interface RaitReconciliation {
  id: string;
  tenant_id: string;
  system: string;
  window_from: string;
  window_to: string;
  requested_by: string;
  requested_at: string;
  status: string;
  divergences_count: number;
  report_document_id?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
