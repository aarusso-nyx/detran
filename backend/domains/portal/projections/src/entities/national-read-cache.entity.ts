// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.1 sha256:b30e4ad53da99d2d4e5fb17ef4f0c9c8cdf5814458a99505c92f04945c482281
export interface NationalReadCache {
  id: string;
  tenant_id: string;
  subject_id: string;
  kind: string;
  target_id?: string | null;
  payload_json: Record<string, unknown>;
  cached_at: string;
  created_at: string;
  updated_at?: string | null;
}
