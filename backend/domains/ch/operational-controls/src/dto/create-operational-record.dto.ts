// Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da
export interface CreateOperationalRecordDto {
  record_kind: string;
  subject_type: string;
  subject_id?: string | null;
  clinic_id?: string | null;
  status: string;
  payload?: Record<string, unknown>;
}
