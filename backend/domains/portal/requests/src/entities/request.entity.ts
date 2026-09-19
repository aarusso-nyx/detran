// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
export interface Request {
  id: string;
  tenant_id: string;
  state: string;
  service_key: string;
  subject_id: string;
  target_kind: string;
  target_id?: string | null;
  channel: string;
  delegation_domain?: string | null;
  delegation_command?: string | null;
  delegation_external_id?: string | null;
  delegation_status: string;
  delegation_error?: string | null;
  minimum_assurance: string;
  version: number;
  withdrawn_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
