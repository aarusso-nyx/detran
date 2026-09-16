// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
export interface CreatePointsViewDto {
  subject_cpf_hash: string;
  definitive_points: number;
  disputed_points: number;
  by_vehicle_json: Record<string, unknown>;
  last_12_months_json: Record<string, unknown>;
  last_event_id?: string | null;
  cached_at?: string | null;
}
