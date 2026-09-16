// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
export interface ProjectionAppliedEvent {
  id: string;
  tenant_id: string;
  event_id: string;
  projection: string;
  applied_at: string;
  last_error?: string | null;
  created_at: string;
  updated_at?: string | null;
}
