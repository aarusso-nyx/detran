// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
export interface ReportAddendum {
  id: string;
  tenant_id: string;
  report_id: string;
  reason: string;
  content: Record<string, unknown>;
  content_sha256: string;
  status: string;
  requested_by: string;
  approved_by?: string | null;
  approved_at?: string | null;
  storage_document_id?: string | null;
  artifact_sha256?: string | null;
  signed_at?: string | null;
  tsa_time?: string | null;
  certificate_validation_source?: string | null;
  certificate_validation_status?: string | null;
  certificate_validated_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
