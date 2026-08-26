// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
export interface CreateRaitAssignmentDto {
  case_id: string;
  pool_id: string;
  member_id: string;
  assigned_at?: string;
  assigned_by?: string | null;
  released_at?: string | null;
  release_reason?: string | null;
  active?: boolean;
}
