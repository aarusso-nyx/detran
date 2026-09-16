// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
export interface PushSubscription {
  id: string;
  tenant_id: string;
  subject_id: string;
  endpoint: string;
  keys_json: Record<string, unknown>;
  created_at: string;
  updated_at?: string | null;
}
