// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
export interface CreateInfractionViewDto {
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
}
