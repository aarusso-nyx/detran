// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
export interface RaitBatchItem {
  id: string;
  tenant_id: string;
  batch_id: string;
  case_id: string;
  position: number;
  member_id?: string | null;
  claim_due_on?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  decline_kind?: string | null;
  created_at: string;
  updated_at?: string | null;
}
