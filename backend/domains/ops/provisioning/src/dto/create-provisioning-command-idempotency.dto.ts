// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
export interface CreateProvisioningCommandIdempotencyDto {
  command_name: string;
  idempotency_key: string;
  request_digest: string;
  response_body_json: Record<string, unknown>;
  response_etag: string;
  completed_at?: string;
}
