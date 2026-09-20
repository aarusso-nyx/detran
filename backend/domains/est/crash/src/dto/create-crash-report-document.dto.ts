// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
export interface CreateCrashReportDocumentDto {
  crash_record_id: string;
  document_kind: string;
  template_key: string;
  template_version: string;
  policy_id: string;
  storage_key: string;
  content_hash: string;
  byte_size: number;
  signature_ref?: string | null;
  pdfa_conformance: string;
  pdfa_validation: Record<string, unknown>;
  supersedes_document_id?: string | null;
}
