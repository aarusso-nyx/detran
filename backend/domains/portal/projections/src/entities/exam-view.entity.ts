// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
export interface ExamView {
  id: string;
  tenant_id: string;
  exam_id: string;
  subject_cpf_hash: string;
  legal_label: string;
  valid_until?: string | null;
  board_due_on?: string | null;
  last_event_id: string;
  created_at: string;
  updated_at?: string | null;
}
