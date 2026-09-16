// Generated from BP-INF-MEASURES-001 v1.2.0 sha256:f6d05352d77e9c4f6fc86a4c3453ea23771ab90fc5f1cdb0482a10c0cb5dfb8b
export interface CreateAdministrativeTermDto {
  measure_id: string;
  term_type: string;
  term_number: string;
  content_hash: string;
  file_evidence_id?: string | null;
  issued_at: string;
  signed_by_person_id?: string | null;
  signer_name?: string | null;
  withdrawal_deadline_at?: string | null;
  ctb_deadline_at?: string | null;
  field_details_json?: Record<string, unknown> | null;
  source_local_id?: string | null;
  source_idempotency_key?: string | null;
  source_payload_hash?: string | null;
  status?: string;
}
