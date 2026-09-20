// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
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
