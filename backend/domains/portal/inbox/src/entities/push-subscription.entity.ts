// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
export interface PushSubscription {
  id: string;
  tenant_id: string;
  subject_id: string;
  endpoint: string;
  keys_json: Record<string, unknown>;
  created_at: string;
  updated_at?: string | null;
}
