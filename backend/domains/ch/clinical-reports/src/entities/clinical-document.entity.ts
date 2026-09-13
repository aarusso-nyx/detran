// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
export interface ClinicalDocument {
  id: string;
  tenant_id: string;
  encounter_id?: string | null;
  patient_id: string;
  kind: string;
  storage_document_id: string;
  content_type: string;
  sha256: string;
  size_bytes: number;
  uploaded_by: string;
  created_at: string;
  updated_at?: string | null;
}
