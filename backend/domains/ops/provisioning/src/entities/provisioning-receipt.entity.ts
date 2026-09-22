// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
export interface ProvisioningReceipt {
  id: string;
  tenant_id: string;
  package_id: string;
  grant_id: string;
  device_id: string;
  receipt_type: string;
  idempotency_key: string;
  manifest_digest: string;
  device_attestation_json?: Record<string, unknown> | null;
  occurred_at: string;
  received_at: string;
  created_at: string;
  updated_at?: string | null;
}
