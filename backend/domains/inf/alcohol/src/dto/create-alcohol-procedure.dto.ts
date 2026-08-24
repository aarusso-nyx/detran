// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
export interface CreateAlcoholProcedureDto {
  traffic_agency_id: string;
  ait_id?: string | null;
  measure_id?: string | null;
  approach_id?: string | null;
  agent_id: string;
  shift_id: string;
  driver_person_id?: string | null;
  procedure_at: string;
  location_json?: Record<string, unknown> | null;
  procedure_type: string;
  outcome: string;
  status?: string;
  notes?: string | null;
  location_geom?: unknown | null;
}
