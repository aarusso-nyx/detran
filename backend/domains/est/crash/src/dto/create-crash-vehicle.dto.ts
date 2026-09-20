// Generated from BP-EST-CRASH-001 v1.0.0 sha256:99e87798f6392afe656eee02132c995fd478884241fc5f7b1ccf7f409e687a62
export interface CreateCrashVehicleDto {
  crash_record_id: string;
  vehicle_snapshot_id?: string | null;
  plate?: string | null;
  role: string;
  sequence: number;
  apparent_damage?: string | null;
  notes?: string | null;
}
