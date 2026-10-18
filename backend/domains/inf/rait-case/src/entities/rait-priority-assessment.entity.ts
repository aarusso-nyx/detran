// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
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
