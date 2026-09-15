// Generated from BP-OPS-OFFLINE-SYNC-001 v1.1.0 sha256:fb2ab9cef5ee5621be533d83fd88a694912460d6fbe4cd446bc2c8d7f7bcfc3d
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
