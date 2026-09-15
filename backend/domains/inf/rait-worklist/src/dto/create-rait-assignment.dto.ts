// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
export interface CreateRaitAssignmentDto {
  case_id: string;
  pool_id: string;
  member_id: string;
  assigned_at?: string;
  assigned_by?: string | null;
  released_at?: string | null;
  release_reason?: string | null;
  active?: boolean;
  claim_due_at?: string | null;
  batch_id?: string | null;
}
