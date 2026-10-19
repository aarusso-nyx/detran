// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
