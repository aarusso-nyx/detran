// Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0 sha256:0fc842b8a5a36fe3ca506127d7341f9c7bf183f2956d1c77485c5e3f6a8db18c
export interface CreateClinicalControlEventDto {
  encounter_id: string;
  medical_exam_id?: string | null;
  psychological_exam_id?: string | null;
  control_kind: string;
  payload?: Record<string, unknown>;
}
