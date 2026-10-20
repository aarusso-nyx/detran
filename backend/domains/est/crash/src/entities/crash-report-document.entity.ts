// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
export interface CrashReportDocument {
  id: string;
  tenant_id: string;
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
  sealed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
