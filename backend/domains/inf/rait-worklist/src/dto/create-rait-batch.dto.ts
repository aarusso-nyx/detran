// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
