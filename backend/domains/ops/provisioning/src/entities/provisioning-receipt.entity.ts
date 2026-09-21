// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
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
