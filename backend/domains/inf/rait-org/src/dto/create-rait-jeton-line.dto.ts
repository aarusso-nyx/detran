// Generated from BP-INF-RAIT-ORG-001 v1.0.0 sha256:4f035821c870a58065e91330193c1d2d97076255109085c6a40e5b30690a8ba5
export interface CreateRaitJetonLineDto {
  sheet_id: string;
  member_id: string;
  session_id: string;
  minutes_id?: string | null;
  attendance_valid?: boolean;
  items_reported?: number;
  votes_cast?: number;
  absence_kind?: string | null;
  remunerated?: boolean;
  over_cap?: boolean;
  unit_value?: number | null;
  amount?: number | null;
  source_pending?: boolean;
}
