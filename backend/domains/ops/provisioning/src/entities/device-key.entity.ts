// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
export interface DeviceKey {
  id: string;
  tenant_id: string;
  device_id: string;
  key_fingerprint: string;
  public_key: string;
  attestation_evidence_json: Record<string, unknown>;
  key_algorithm: string;
  wire_format: string;
  status: string;
  version: number;
  registered_at: string;
  revoked_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
