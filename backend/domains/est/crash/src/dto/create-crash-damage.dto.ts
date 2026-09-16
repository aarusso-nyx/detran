// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
export interface CreateCrashDamageDto {
  crash_record_id: string;
  asset_kind: string;
  description: string;
  responsible_identified?: boolean | null;
  notify_road_owner?: boolean | null;
}
