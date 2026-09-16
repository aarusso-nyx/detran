// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
export interface AcknowledgementEvidence {
  id: string;
  tenant_id: string;
  inbox_item_id: string;
  displayed_sha256: string;
  acknowledged_at: string;
  signature_ref?: string | null;
  created_at: string;
  updated_at?: string | null;
}
