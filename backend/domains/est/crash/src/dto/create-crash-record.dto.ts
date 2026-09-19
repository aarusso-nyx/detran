// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
export interface CreateCrashRecordDto {
  traffic_agency_id: string;
  crash_type: string;
  severity: string;
  state?: string;
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
  version?: number;
}
