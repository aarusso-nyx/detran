// Generated from BP-EST-CRASH-001 v1.0.0 sha256:c18a59211bfcb807a25253f1870329f9736463b1ecef41b564397f1eed088513
export interface CrashWitness {
  id: string;
  tenant_id: string;
  crash_record_id: string;
  name: string;
  contact?: string | null;
  refused: boolean;
  statement_summary?: string | null;
  created_at: string;
  updated_at?: string | null;
}
