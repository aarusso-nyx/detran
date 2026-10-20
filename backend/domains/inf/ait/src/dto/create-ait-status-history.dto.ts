// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
export interface CreateAitStatusHistoryDto {
  ait_id: string;
  status: string;
  changed_at?: string;
  user_ref?: string | null;
  system_name?: string | null;
  reason?: string | null;
  details_json?: Record<string, unknown> | null;
}
