// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
export interface BiometricReference {
  id: string;
  tenant_id: string;
  patient_id: string;
  kind: string;
  provider_code: string;
  provider_reference: string;
  storage_document_id: string;
  sha256: string;
  quality_score?: number | null;
  created_at: string;
  updated_at?: string | null;
}
