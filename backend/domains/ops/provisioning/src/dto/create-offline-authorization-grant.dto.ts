// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
export interface CreateOfflineAuthorizationGrantDto {
  traffic_agency_id: string;
  device_id: string;
  device_key_fingerprint: string;
  authorized_agents_json: {
    agent_id: string;
    registration_number: string;
    roles: string[];
    permissions: string[];
  }[];
  valid_from: string;
  valid_until: string;
  maximum_offline_seconds: number;
  maximum_acts: number;
  revocation_epoch: number;
  policy_version: string;
  normative_package_id: string;
  numbering_reservation_ids_json: string[];
  issued_at?: string;
  issued_by_subject: string;
  key_id: string;
  schema_version?: string;
  manifest_digest: string;
  status?: string;
  version?: number;
  revoked_at?: string | null;
}
