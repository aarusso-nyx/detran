// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.2 sha256:dbdb30cf6d6e61f8180f89ece1cf3a2b22b13e3bb2d41e3480c7d13f917688f5
export interface RaitBench {
  id: string;
  tenant_id: string;
  session_id: string;
  state: string;
  confirmed_count: number;
  parity_observed?: boolean | null;
  confirmed_at?: string | null;
  insufficient_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
