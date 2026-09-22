// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
export interface CreateRaitQualitySampleDto {
  period_start: string;
  period_end: string;
  case_id: string;
  decision_id?: string | null;
  reviewer_member_id?: string | null;
  sampled_at?: string;
  reviewed_at?: string | null;
  finding_kind?: string | null;
  finding_note?: string | null;
  systemic?: boolean;
}
