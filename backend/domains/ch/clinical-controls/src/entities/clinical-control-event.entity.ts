// Generated from BP-CH-CLINICAL-CONTROLS-001 v1.0.0 sha256:0fc842b8a5a36fe3ca506127d7341f9c7bf183f2956d1c77485c5e3f6a8db18c
export interface ClinicalControlEvent {
  id: string;
  tenant_id: string;
  encounter_id: string;
  medical_exam_id?: string | null;
  psychological_exam_id?: string | null;
  control_kind: string;
  status: string;
  payload: Record<string, unknown>;
  recorded_by: string;
  recorded_at: string;
  created_at: string;
  updated_at?: string | null;
}
