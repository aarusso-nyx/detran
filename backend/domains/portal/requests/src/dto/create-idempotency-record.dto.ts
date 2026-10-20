// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:5473ac653449e703579b07347c595f918249dd6308961a12198eab656de781ae
export interface CreateIdempotencyRecordDto {
  key: string;
  subject_id?: string | null;
  route: string;
  body_sha256: string;
  response_json: Record<string, unknown>;
  status: number;
}
