// Generated from BP-CH-BIOMETRICS-001 v1.1.0 sha256:23fc0416b68ed64cb3247e3a7945a7f7ae42043134403c34124d78f9a5dfd939
export interface CreateBiometricCheckDto {
  appointment_id?: string | null;
  encounter_id?: string | null;
  clinic_id: string;
  station_id: string;
  subject_patient_id?: string | null;
  subject_professional_id?: string | null;
  kind: string;
  modality: string;
}
