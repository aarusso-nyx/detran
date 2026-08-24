// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
export interface CreateAdministrativeMeasureDto {
  traffic_agency_id: string;
  measure_type_id: string;
  ait_id?: string | null;
  crash_record_id?: string | null;
  approach_id?: string | null;
  agent_id: string;
  shift_id: string;
  device_id: string;
  started_at: string;
  ended_at?: string | null;
  location_json?: Record<string, unknown> | null;
  reason: string;
  current_status?: string;
  notes?: string | null;
  location_geom?: unknown | null;
}
