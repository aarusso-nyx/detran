// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
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
