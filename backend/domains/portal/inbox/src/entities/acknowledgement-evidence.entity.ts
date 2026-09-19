// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
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
