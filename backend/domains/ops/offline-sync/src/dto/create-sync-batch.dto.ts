// Generated from BP-OPS-OFFLINE-SYNC-001 v1.0.0 sha256:21bcd6e203b7ff643de48a32fe2947a4e7ad1f7b62b66209c60e24c97da59ce9
export interface CreateSyncBatchDto {
  traffic_agency_id: string;
  agent_id: string;
  device_id: string;
  device_batch_id: string;
  batch_sequence?: number | null;
  submitted_at?: string;
  accepted_items?: number;
  receipts_json?: Record<string, unknown> | null;
}
