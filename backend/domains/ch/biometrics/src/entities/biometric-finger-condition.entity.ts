// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
export interface BiometricFingerCondition {
  id: string;
  tenant_id: string;
  patient_id: string;
  finger_code: string;
  condition: string;
  reason?: string | null;
  recorded_by: string;
  created_at: string;
  updated_at?: string | null;
}
