// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
export interface CreateCrashVehicleDto {
  crash_record_id: string;
  vehicle_snapshot_id?: string | null;
  plate?: string | null;
  role: string;
  sequence: number;
  apparent_damage?: string | null;
  notes?: string | null;
}
