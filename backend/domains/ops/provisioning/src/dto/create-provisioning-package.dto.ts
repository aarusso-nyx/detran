// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
export interface CreateProvisioningPackageDto {
  grant_id: string;
  device_id: string;
  schema_version?: string;
  manifest_digest: string;
  artifact_digests_json: Record<string, unknown>;
  trust_chain_json: Record<string, unknown>;
  normative_package_id: string;
  numbering_policy_json: Record<string, unknown>;
  envelope_uri: string;
  signature_key_id: string;
  signature_algorithm?: string;
  envelope_algorithm?: string;
  wire_format?: string;
  status?: string;
  version?: number;
  issued_at?: string;
  expires_at?: string | null;
}
