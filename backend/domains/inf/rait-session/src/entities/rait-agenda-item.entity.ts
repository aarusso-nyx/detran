// Generated from BP-INF-RAIT-SESSION-001 v1.0.0 sha256:dc1bce75baacc50799dc941fd01f8c5ccd3ca217522ca280f4fbea215d197a05
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
  created_at: string;
  updated_at?: string | null;
}
