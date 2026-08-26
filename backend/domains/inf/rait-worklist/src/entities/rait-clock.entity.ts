// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
export interface RaitClock {
  id: string;
  tenant_id: string;
  case_id: string;
  clock_code: string;
  started_on: string;
  ceiling_on: string;
  flag: string;
  flag_changed_at: string;
  last_reset_at?: string | null;
  legal_basis: string;
  created_at: string;
  updated_at?: string | null;
}
