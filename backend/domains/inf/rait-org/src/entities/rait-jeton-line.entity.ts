// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
export interface RaitJetonLine {
  id: string;
  tenant_id: string;
  sheet_id: string;
  member_id: string;
  session_id: string;
  minutes_id?: string | null;
  attendance_valid: boolean;
  items_reported: number;
  votes_cast: number;
  absence_kind?: string | null;
  remunerated: boolean;
  over_cap: boolean;
  unit_value?: number | null;
  amount?: number | null;
  source_pending: boolean;
  created_at: string;
  updated_at?: string | null;
}
