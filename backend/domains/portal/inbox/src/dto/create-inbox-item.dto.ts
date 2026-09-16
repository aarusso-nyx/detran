// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
export interface CreateInboxItemDto {
  subject_id: string;
  kind: string;
  action_required?: boolean;
  source: string;
  source_event_id: string;
  subject_line: string;
  summary: string;
  ait_id?: string | null;
  request_id?: string | null;
  available_on: string;
  read_on?: string | null;
  fictitious_acknowledgement_on?: string | null;
  deadline_due_on?: string | null;
  deadline_owned_by?: string | null;
}
