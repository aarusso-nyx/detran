// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
export interface CrashDamage {
  id: string;
  tenant_id: string;
  crash_record_id: string;
  asset_kind: string;
  description: string;
  responsible_identified?: boolean | null;
  notify_road_owner?: boolean | null;
  created_at: string;
  updated_at?: string | null;
}
