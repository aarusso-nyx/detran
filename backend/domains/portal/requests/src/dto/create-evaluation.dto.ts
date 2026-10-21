// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
export interface CreateEvaluationDto {
  subject_kind: string;
  subject_id: string;
  scores_json: Record<string, unknown>;
  comment?: string | null;
  submitted_at: string;
}
