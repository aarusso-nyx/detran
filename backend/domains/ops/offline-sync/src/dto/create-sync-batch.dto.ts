// Generated from BP-OPS-OFFLINE-SYNC-001 v1.3.0 sha256:060a1bba7bd902d60194a1ee2fe169a4b0972602bd54e5330083d9c518641e52
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
