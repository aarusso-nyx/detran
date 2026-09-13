// Generated from BP-CH-JUNTAS-001 v1.0.0 sha256:5c7e357c88ac5886f460c789a7607211ada27acd49d6f9fd47df0da89ad064f2
export interface JuntaDecision {
  id: string;
  tenant_id: string;
  case_id: string;
  board_id: string;
  outcome: string;
  rationale: string;
  content_sha256: string;
  storage_document_id: string;
  artifact_sha256: string;
  signature_level: string;
  signature_format: string;
  signed_at: string;
  tsa_time: string;
  certificate_validation_source: string;
  certificate_validation_status: string;
  certificate_validated_at: string;
  decided_at: string;
  recorded_by: string;
  administrative_exhausted: boolean;
  created_at: string;
  updated_at?: string | null;
}
