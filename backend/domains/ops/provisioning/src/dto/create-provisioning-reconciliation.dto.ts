// Generated from BP-OPS-PROVISIONING-001 v1.0.3 sha256:a000d19d0e307a2303ca60295e3ffcc514801b018c0d3b79821c19c2fcda1b35
export interface CreateProvisioningReconciliationDto {
  grant_id: string;
  device_id: string;
  reconciliation_digest: string;
  accepted_act_count?: number;
  rejected_act_count?: number;
  unresolved_act_count?: number;
  reconciled_by_subject: string;
  reconciled_at?: string;
}
