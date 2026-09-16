// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
