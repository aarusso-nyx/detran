// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
export interface AlcoholProcedure {
  id: string;
  tenant_id: string;
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
  status: string;
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
  created_at: string;
  updated_at?: string | null;
}
