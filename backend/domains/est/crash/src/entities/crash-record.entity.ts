// Generated from BP-EST-CRASH-001 v1.0.0 sha256:4a862a5d1fd8f24a085897b18c3eb15f3c8e9d822d978efc8d07229f4c13b655
export interface CrashRecord {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  crash_type: string;
  severity: string;
  state: string;
  national_status?: string | null;
  occurred_at: string;
  recorded_at: string;
  location_description: string;
  location_json?: Record<string, unknown> | null;
  location_reference?: string | null;
  municipality_code: string;
  uf: string;
  road?: string | null;
  km?: string | null;
  direction?: string | null;
  road_condition: string;
  weather_condition: string;
  lighting_condition: string;
  signage_condition: string;
  dynamics_description?: string | null;
  shift_id?: string | null;
  device_id?: string | null;
  operation_id?: string | null;
  source_system?: string | null;
  source_local_id?: string | null;
  source_idempotency_key?: string | null;
  source_payload_hash?: string | null;
  version: number;
  created_at: string;
  updated_at?: string | null;
}
