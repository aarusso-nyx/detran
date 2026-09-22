// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
export interface ProvisioningCommandIdempotency {
  id: string;
  tenant_id: string;
  command_name: string;
  idempotency_key: string;
  request_digest: string;
  response_body_json: Record<string, unknown>;
  response_etag: string;
  completed_at: string;
  created_at: string;
  updated_at?: string | null;
}
