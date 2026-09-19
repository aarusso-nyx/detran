// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
export interface CreateRaitSessionDto {
  judging_body: string;
  state?: string;
  scheduled_for?: string | null;
  agenda_closed_at?: string | null;
  convened_at?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  quorum_required: number;
  quorum_observed?: number | null;
  chair_member_id?: string | null;
  adjourned_reason?: string | null;
  extraordinary?: boolean;
  short_notice_ack_by?: string | null;
  modality?: string;
  short_notice_ack?: boolean;
}
