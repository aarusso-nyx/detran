// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:c35fb9b7cf739cf06c18b8cc02b1ec4cd968c63916ffd149c79d29937faa2c67
export interface CreateSyncQueueItemDto {
  traffic_agency_id: string;
  device_id: string;
  agent_id: string;
  entity_type: string;
  local_entity_id: string;
  server_entity_id?: string | null;
  status?: string;
  attempts?: number;
  created_locally_at: string;
  sent_at?: string | null;
  received_at?: string | null;
  idempotency_key: string;
  payload_hash: string;
  payload_json: Record<string, unknown>;
  error_code?: string | null;
  error_message?: string | null;
}
