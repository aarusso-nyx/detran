// Generated from BP-INF-RAIT-CASE-001 v1.2.0 sha256:e9e4916988b2bb485cd08216fc2bf2b441c013a55c05124de7f731eb9229ac17
export interface CreateRaitPriorityAssessmentDto {
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
}
