// Generated from BP-OPS-EVIDENCE-001 v1.0.0 sha256:a8692e7ee4171aea45d3aa6a8ca457251f3005b1dc05d1b03e2aa5ebc8f1923f
export interface StorageIntent {
  id: string;
  tenant_id: string;
  evidence_id: string;
  idempotency_key: string;
  local_evidence_id: string;
  object_key: string;
  expires_at: string;
  accepted_hash?: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
}
