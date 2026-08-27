// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
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
  created_at: string;
  updated_at?: string | null;
}
