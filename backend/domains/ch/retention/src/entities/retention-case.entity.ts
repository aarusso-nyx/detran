// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
export interface RetentionCase {
  id: string;
  tenant_id: string;
  patient_id: string;
  custodian: string;
  last_record_at: string;
  eligible_after: string;
  preservation_status: string;
  status: string;
  block_reasons: Record<string, unknown>;
  assessed_by: string;
  assessed_at: string;
  created_at: string;
  updated_at?: string | null;
}
