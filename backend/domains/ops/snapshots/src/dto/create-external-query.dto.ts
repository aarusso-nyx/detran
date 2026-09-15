// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
export interface CreateExternalQueryDto {
  traffic_agency_id: string;
  user_ref: string;
  agent_id?: string | null;
  device_id?: string | null;
  external_system_id: string;
  query_type: string;
  parameters_hash: string;
  purpose: string;
  queried_at?: string;
  status: string;
  protocol?: string | null;
  result_summary?: string | null;
  result_snapshot_json?: Record<string, unknown> | null;
}
