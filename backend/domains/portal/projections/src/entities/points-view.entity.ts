// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
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
