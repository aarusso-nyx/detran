// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
export interface CreateIdempotencyRecordDto {
  key: string;
  subject_id?: string | null;
  route: string;
  body_sha256: string;
  response_json: Record<string, unknown>;
  status: number;
}
