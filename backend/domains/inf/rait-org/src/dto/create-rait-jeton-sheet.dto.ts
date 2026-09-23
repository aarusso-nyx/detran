// Generated from BP-INF-RAIT-ORG-001 v1.0.1 sha256:7ece9578325dfb4c1a393f1ce7805146a621d5e7b4b843176533126efd74d55d
export interface CreateRaitJetonSheetDto {
  judging_body: string;
  period_start: string;
  period_end: string;
  state?: string;
  generated_at?: string;
  generated_by?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  homologated_at?: string | null;
  homologated_by?: string | null;
  sent_at?: string | null;
  document_id?: string | null;
  source_pending?: boolean;
}
