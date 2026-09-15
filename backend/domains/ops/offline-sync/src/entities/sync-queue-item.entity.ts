// Generated from BP-OPS-OFFLINE-SYNC-001 v1.2.0 sha256:caa6ee5fb47a5169864e22d9763e35d774009a12ac8d550129bacf8d39ac2cac
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
