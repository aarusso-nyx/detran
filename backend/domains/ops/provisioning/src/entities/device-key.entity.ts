// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
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
