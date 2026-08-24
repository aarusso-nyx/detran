// Generated from BP-INF-MEASURES-001 v1.0.0 sha256:5579cc45b6f017e5fe67a0f399f4547a0efae00552c7609c33d7257e572be367
export interface CreateAdministrativeTermDto {
  measure_id: string;
  term_type: string;
  term_number: string;
  content_hash: string;
  file_evidence_id?: string | null;
  issued_at: string;
  signed_by_person_id?: string | null;
  status?: string;
}
