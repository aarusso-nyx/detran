// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
export interface Report {
  id: string;
  tenant_id: string;
  encounter_id: string;
  kind: string;
  source_exam_id: string;
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
  created_at: string;
  updated_at?: string | null;
}
