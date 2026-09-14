// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
export interface RaitSession {
  id: string;
  tenant_id: string;
  judging_body: string;
  state: string;
  scheduled_for?: string | null;
  agenda_closed_at?: string | null;
  convened_at?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  quorum_required: number;
  quorum_observed?: number | null;
  chair_member_id?: string | null;
  adjourned_reason?: string | null;
  extraordinary: boolean;
  short_notice_ack_by?: string | null;
  modality: string;
  short_notice_ack: boolean;
  created_at: string;
  updated_at?: string | null;
}
