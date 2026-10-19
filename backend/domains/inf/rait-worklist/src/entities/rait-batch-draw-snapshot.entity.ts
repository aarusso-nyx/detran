// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
export interface RaitBatchDrawSnapshot {
  id: string;
  tenant_id: string;
  batch_id: string;
  snapshot_version: string;
  snapshot: Record<string, unknown>;
  snapshot_hash: string;
  origin: string;
  created_at: string;
  updated_at?: string | null;
}
