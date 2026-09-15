// Generated from BP-INF-RAIT-SESSION-001 v1.1.0 sha256:24f07dd684f9142de9db5e84913c3e2899499e68aebd1d6ac33dc0a03c5eca01
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
  created_at: string;
  updated_at?: string | null;
}
