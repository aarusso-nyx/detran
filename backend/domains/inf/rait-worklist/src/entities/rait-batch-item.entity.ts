// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
