// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:be057438a0ae6bba679549fa27603002919b4035701f4ea81d9ed853b9c00734
export interface ExternalQuery {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  user_ref: string;
  agent_id?: string | null;
  device_id?: string | null;
  external_system_id: string;
  query_type: string;
  parameters_hash: string;
  purpose: string;
  queried_at: string;
  status: string;
  protocol?: string | null;
  result_summary?: string | null;
  result_snapshot_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at?: string | null;
}
