// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
export interface InboxItem {
  id: string;
  tenant_id: string;
  subject_id: string;
  kind: string;
  action_required: boolean;
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
  created_at: string;
  updated_at?: string | null;
}
