// Generated from BP-INF-MEASURES-001 v1.1.0 sha256:0d61bf54d2c0383839c31d1ecb76100ecb64d1f60e1285f5d621451b36d3995c
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
