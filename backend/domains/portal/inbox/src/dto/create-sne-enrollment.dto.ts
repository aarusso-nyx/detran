// Generated from BP-PORTAL-INBOX-001 v1.0.2 sha256:c04ef2d9c11828696abb081206e353636a01f9f86c39e28acfc0ada5addf53da
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
