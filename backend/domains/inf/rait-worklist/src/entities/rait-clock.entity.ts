// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
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
