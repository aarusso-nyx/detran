// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
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
