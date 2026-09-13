// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
export interface RetentionHold {
  id: string;
  tenant_id: string;
  retention_case_id: string;
  reason: string;
  status: string;
  imposed_by: string;
  released_by?: string | null;
  released_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
