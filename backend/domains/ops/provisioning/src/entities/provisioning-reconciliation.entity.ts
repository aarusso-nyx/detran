// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:d69b89cb05b138c5417b6cfe4784273f1d068fede6dd643403a21e5c314f4ac6
export interface ProvisioningReconciliation {
  id: string;
  tenant_id: string;
  grant_id: string;
  device_id: string;
  reconciliation_digest: string;
  accepted_act_count: number;
  rejected_act_count: number;
  unresolved_act_count: number;
  reconciled_by_subject: string;
  reconciled_at: string;
  created_at: string;
  updated_at?: string | null;
}
