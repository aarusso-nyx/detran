// Generated from BP-EST-CRASH-001 v1.0.0 sha256:b47af7c82f17c4a1fa3e3eefb69f476ee022559780b97f30285d2582d18c8231
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
