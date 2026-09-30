// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:56d0c4dd4d9f1a20f38bbcc7372af113898d34e435e79b5cccc2ab1e077d0479
export interface SyncQueueItem {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  device_id: string;
  agent_id: string;
  entity_type: string;
  local_entity_id: string;
  server_entity_id?: string | null;
  status: string;
  attempts: number;
  created_locally_at: string;
  sent_at?: string | null;
  received_at?: string | null;
  idempotency_key: string;
  payload_hash: string;
  payload_json: Record<string, unknown>;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at?: string | null;
}
