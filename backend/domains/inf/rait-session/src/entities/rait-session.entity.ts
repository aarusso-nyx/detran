// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
  created_at: string;
  updated_at?: string | null;
}
