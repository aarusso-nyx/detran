// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
export interface IdempotencyRecord {
  id: string;
  tenant_id: string;
  key: string;
  subject_id?: string | null;
  route: string;
  body_sha256: string;
  response_json: Record<string, unknown>;
  status: number;
  created_at: string;
  updated_at?: string | null;
}
