// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
export interface AdministrativeMeasure {
  id: string;
  tenant_id: string;
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
  current_status: string;
  notes?: string | null;
  location_geom?: unknown | null;
  created_at: string;
  updated_at?: string | null;
}
