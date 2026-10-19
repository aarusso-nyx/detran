// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
export interface CreateRaitBatchDto {
  pool_id: string;
  kind?: string;
  week_start: string;
  state?: string;
  seed?: string | null;
  opened_at?: string;
  opened_by?: string | null;
  drawn_at?: string | null;
  accepted_at?: string | null;
  minutes_document_id?: string | null;
  homologated_at?: string | null;
  homologated_by?: string | null;
}
