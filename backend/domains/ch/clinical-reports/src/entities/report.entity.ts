// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
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
