// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
export interface CreateBiometricReferenceDto {
  patient_id: string;
  kind: string;
  provider_code: string;
  provider_reference: string;
  storage_document_id: string;
  sha256: string;
  quality_score?: number | null;
}
