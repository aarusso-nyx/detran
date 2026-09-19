// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
export interface RaitAssignment {
  id: string;
  tenant_id: string;
  case_id: string;
  pool_id: string;
  member_id: string;
  assigned_at: string;
  assigned_by?: string | null;
  released_at?: string | null;
  release_reason?: string | null;
  active: boolean;
  claim_due_at?: string | null;
  batch_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
