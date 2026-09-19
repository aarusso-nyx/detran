// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
export interface RaitAgendaItem {
  id: string;
  tenant_id: string;
  session_id: string;
  case_id: string;
  position: number;
  priority: boolean;
  rapporteur_member_id: string;
  opinion_summary?: string | null;
  opinion_analysis?: string | null;
  opinion_vote?: string | null;
  opinion_registered_at?: string | null;
  read_at?: string | null;
  proclaimed_at?: string | null;
  outcome?: string | null;
  withdrawn: boolean;
  withdrawn_reason?: string | null;
  view_requested_by?: string | null;
  view_due_on?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
