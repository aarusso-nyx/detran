// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
