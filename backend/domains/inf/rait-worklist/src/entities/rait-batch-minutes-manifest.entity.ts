// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
export interface RaitBatchMinutesManifest {
  id: string;
  tenant_id: string;
  batch_id: string;
  document_id: string;
  content_hash: string;
  snapshot_hash: string;
  snapshot_version: string;
  document_kind: string;
  expected_signer_person_id: string;
  manifest_hash?: string | null;
  manifest_version?: string | null;
  prepared_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
