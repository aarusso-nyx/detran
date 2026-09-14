// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
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
