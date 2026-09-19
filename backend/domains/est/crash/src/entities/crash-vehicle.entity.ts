// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
export interface CrashVehicle {
  id: string;
  tenant_id: string;
  crash_record_id: string;
  vehicle_snapshot_id?: string | null;
  plate?: string | null;
  role: string;
  sequence: number;
  apparent_damage?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
}
