// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
export interface RaitBatch {
  id: string;
  tenant_id: string;
  pool_id: string;
  kind: string;
  week_start: string;
  state: string;
  seed?: string | null;
  opened_at: string;
  opened_by?: string | null;
  drawn_at?: string | null;
  accepted_at?: string | null;
  minutes_document_id?: string | null;
  homologated_at?: string | null;
  homologated_by?: string | null;
  version: number;
  approval_signature_ref?: string | null;
  approval_receipt_hash?: string | null;
  approval_verified_at?: string | null;
  approval_signer_person_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
