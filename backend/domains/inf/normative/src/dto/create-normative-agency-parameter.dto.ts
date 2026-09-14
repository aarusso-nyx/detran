// Generated from BP-INF-NORMATIVE-001 v1.0.0 sha256:13122b32afc4e95a5acd5e4e83201d632a049d42739ec80f5f86820b6dbd77e7
export interface CreateNormativeAgencyParameterDto {
  traffic_agency_id: string;
  key: string;
  value_json: Record<string, unknown>;
  value_type: string;
  valid_from: string;
  valid_to?: string | null;
  status?: string;
}
