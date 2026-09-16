// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
export interface CreateNationalReadCacheDto {
  subject_id: string;
  kind: string;
  target_id?: string | null;
  payload_json: Record<string, unknown>;
  cached_at: string;
}
