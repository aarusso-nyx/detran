// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
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
