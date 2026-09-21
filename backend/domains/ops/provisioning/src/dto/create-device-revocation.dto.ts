// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
export interface CreateDeviceRevocationDto {
  device_id: string;
  grant_id?: string | null;
  revocation_epoch: number;
  reason_code: string;
  decision_by_subject: string;
  decided_at: string;
}
