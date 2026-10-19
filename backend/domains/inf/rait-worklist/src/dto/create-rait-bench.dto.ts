// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
export interface CreateRaitBenchDto {
  session_id: string;
  state?: string;
  confirmed_count?: number;
  parity_observed?: boolean | null;
  confirmed_at?: string | null;
  insufficient_at?: string | null;
}
