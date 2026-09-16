// Generated from BP-OPS-EVIDENCE-001 v1.1.0 sha256:e739cf21c78ced39113911fbf0c9950d0c2091ab58cc4efedee4225786fe9eac
export interface CreateStorageIntentDto {
  evidence_id: string;
  idempotency_key: string;
  local_evidence_id: string;
  object_key: string;
  expires_at: string;
  accepted_hash?: string | null;
  status: string;
}
