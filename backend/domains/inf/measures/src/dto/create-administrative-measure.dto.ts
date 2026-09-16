// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
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
