// Generated from BP-PORTAL-PROJECTIONS-001 v1.0.2 sha256:5deaf3bb32dddcda371d363d5b4d7c5b8f3e0ec17cea92357ccf01a121943012
export interface CreateNationalReadCacheDto {
  subject_id: string;
  kind: string;
  target_id?: string | null;
  payload_json: Record<string, unknown>;
  cached_at: string;
}
