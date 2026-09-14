// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
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
