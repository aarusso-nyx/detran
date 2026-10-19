// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
export interface RaitClaimLegacyQualification {
  id: string;
  tenant_id: string;
  case_id: string;
  observed_version: number;
  observed_state: string;
  assignment_status: string;
  classification: string;
  revision: number;
  admission_ref?: string | null;
  distribution_ref?: string | null;
  assignment_ref?: string | null;
  pool_scope_ref?: string | null;
  reason?: string | null;
  reviewer_id: string;
  authorization_ref: string;
  observed_at: string;
  created_at: string;
  updated_at?: string | null;
}
