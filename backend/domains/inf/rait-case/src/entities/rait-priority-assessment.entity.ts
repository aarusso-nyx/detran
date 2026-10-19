// Generated from BP-INF-RAIT-CASE-001 v1.3.0 sha256:1cc510a10cfe7e10e232b53291df1132f8a90e54bce9c71c4e2c39acbfa41af2
export interface RaitPriorityAssessment {
  id: string;
  tenant_id: string;
  case_id: string;
  revision: number;
  outcome: string;
  assessed_at: string;
  assessed_by: string;
  qualification_on: string;
  timezone: string;
  policy_parameter_id: string;
  policy_version: number;
  policy_snapshot: Record<string, unknown>;
  reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
