// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
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
