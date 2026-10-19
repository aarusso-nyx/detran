// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
