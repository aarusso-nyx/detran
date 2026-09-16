// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.0 sha256:0be808a8cab613c80b9fc898d70fcdf1323a979c488210bf692b3c489326b380
export interface PointsView {
  id: string;
  tenant_id: string;
  subject_cpf_hash: string;
  definitive_points: number;
  disputed_points: number;
  by_vehicle_json: Record<string, unknown>;
  last_12_months_json: Record<string, unknown>;
  last_event_id?: string | null;
  cached_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
