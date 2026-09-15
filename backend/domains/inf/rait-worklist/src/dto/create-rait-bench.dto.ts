// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
export interface CreateRaitBenchDto {
  session_id: string;
  state?: string;
  confirmed_count?: number;
  parity_observed?: boolean | null;
  confirmed_at?: string | null;
  insufficient_at?: string | null;
}
