// Generated from BP-CH-REPORTS-001 v1.3.0 sha256:223e3b4e60807d8ac51bcd6d9e1294a65ca305509b8ff1dc2f93649c7f3aa1a5
export interface EpisodeExport {
  id: string;
  tenant_id: string;
  encounter_id: string;
  content_sha256: string;
  storage_document_id: string;
  artifact_sha256: string;
  signer_professional_id: string;
  signer_name: string;
  signer_council: string;
  signature_level: string;
  signature_format: string;
  signed_at: string;
  tsa_time: string;
  certificate_validation_source: string;
  certificate_validation_status: string;
  certificate_validated_at: string;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
