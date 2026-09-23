// Generated from BP-INF-RAIT-INTEGRATION-001 v1.0.1 sha256:2d42a37638b7f6930d1b8ac07d6cd13218f965f5c2857948e0afeea8df277caf
export interface CreateRaitReconciliationDto {
  system: string;
  window_from: string;
  window_to: string;
  requested_by: string;
  requested_at?: string;
  status?: string;
  divergences_count?: number;
  report_document_id?: string | null;
  resolved_at?: string | null;
}
