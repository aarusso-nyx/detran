// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
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
  ait_local_id?: string | null;
  sign_catalog_id?: string | null;
  sign_catalog_version?: string | null;
  driver_name?: string | null;
  driver_document?: string | null;
  vehicle_plate?: string | null;
  vehicle_make?: string | null;
  refused_procedures?: boolean | null;
  driver_statement_json?: Record<string, unknown> | null;
  witnesses_json?: Record<string, unknown> | null;
  source_local_id?: string | null;
  source_idempotency_key?: string | null;
  source_payload_hash?: string | null;
  location_geom?: unknown | null;
}
