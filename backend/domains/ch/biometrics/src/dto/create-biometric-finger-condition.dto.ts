// Generated from BP-CH-BIOMETRICS-001 v1.0.0 sha256:918eef902a9909e28862909f968b34aade0b443ebe3741b3823b9b1761d3cdbb
export interface CreateBiometricFingerConditionDto {
  patient_id: string;
  finger_code: string;
  condition: string;
  reason?: string | null;
  recorded_by: string;
}
