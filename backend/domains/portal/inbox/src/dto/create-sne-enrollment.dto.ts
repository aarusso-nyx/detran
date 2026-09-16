// Generated from BP-PORTAL-INBOX-001 v1.0.1 sha256:1ddffdafcda20768cbaa66e39e4ee4f5346513517e6bb95c6216878d42314ccd
export interface CreateSneEnrollmentDto {
  subject_id: string;
  state: string;
  channel?: string | null;
  email?: string | null;
  phone?: string | null;
  consent_text_version?: string | null;
  effects_ack?: Record<string, unknown> | null;
  since?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
}
