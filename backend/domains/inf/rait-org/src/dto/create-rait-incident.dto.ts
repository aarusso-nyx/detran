// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface CreateRaitIncidentDto {
  incident_ref: string;
  clock_id?: string | null;
  case_id?: string | null;
  opened_at?: string;
  opened_by?: string | null;
  responsible_id?: string | null;
  cause_analysis?: string | null;
  outcome?: string | null;
  legal_notified_at?: string | null;
  closed_at?: string | null;
}
