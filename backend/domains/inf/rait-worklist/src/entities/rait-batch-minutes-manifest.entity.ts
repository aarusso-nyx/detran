// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
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
