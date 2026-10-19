// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
