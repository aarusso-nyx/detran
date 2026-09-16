// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
export interface InfractionView {
  id: string;
  tenant_id: string;
  ait_id: string;
  subject_cpf_hash: string;
  ait_number: string;
  plate: string;
  occurred_at: string;
  framing_label: string;
  amount?: number | null;
  situation: string;
  deadlines_json: Record<string, unknown>;
  points_status: string;
  actions_json: Record<string, unknown>;
  notices_json: Record<string, unknown>;
  payment_json?: Record<string, unknown> | null;
  last_event_id: string;
  last_event_version: number;
  created_at: string;
  updated_at?: string | null;
}
