// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:7c0a0e3e7c424b57f2ad54fff4a784959470ca1969c50cf0cc9e0af6daaa16c4
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
