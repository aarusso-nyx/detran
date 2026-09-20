// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
