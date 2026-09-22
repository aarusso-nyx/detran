// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
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
