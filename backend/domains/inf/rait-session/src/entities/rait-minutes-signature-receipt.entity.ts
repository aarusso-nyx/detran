// Generated from BP-INF-RAIT-SESSION-001 v1.2.2 sha256:0a9063935f0017c3da8110a51763354850095992f1a56199395ef7eda620a45b
export interface RaitMinutesSignatureReceipt {
  id: string;
  tenant_id: string;
  minutes_id: string;
  document_id: string;
  signer_person_id: string;
  signature_ref: string;
  receipt_digest: string;
  content_hash: string;
  snapshot_hash: string;
  manifest_hash: string;
  signature_level: string;
  tsa_status: string;
  certificate_status: string;
  revocation_method: string;
  signed_at: string;
  validated_at: string;
  created_at: string;
  updated_at?: string | null;
}
