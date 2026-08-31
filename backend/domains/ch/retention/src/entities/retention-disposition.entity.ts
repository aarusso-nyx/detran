// Generated from BP-CH-RETENTION-001 v1.0.0 sha256:8a74485eaee2a6dbb8cbc10772396a77b465cdd84cc5a57db0c90035ef24ea78
export interface RetentionDisposition {
  id: string;
  tenant_id: string;
  retention_case_id: string;
  destination: string;
  status: string;
  justification: string;
  proposed_by: string;
  proposed_at: string;
  return_offered_at: string;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
