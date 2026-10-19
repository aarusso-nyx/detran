// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:1b90179b79d5d4ff32396ee08e8b4f308b5c60a90cbf5cd3e6bf1d1fa400265f
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
