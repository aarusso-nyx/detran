// Generated from BP-CH-OPERATIONAL-CONTROLS-001 v1.0.0 sha256:41855aeaa3c52f966b5c30807e1fe3d821258e6c626a32b72238986d291880da
export interface OperationalRecord {
  id: string;
  tenant_id: string;
  record_kind: string;
  subject_type: string;
  subject_id?: string | null;
  clinic_id?: string | null;
  status: string;
  payload: Record<string, unknown>;
  created_by: string;
  created_at: string;
  updated_at?: string | null;
}
