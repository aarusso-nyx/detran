// Generated from BP-INF-RAIT-WORKLIST-001 v1.4.1 sha256:fc1505677703646b1e55dc6283e1e0cce5331627fd5b9bd0ed732c1a77c00430
export interface RaitClockAlert {
  id: string;
  tenant_id: string;
  clock_id: string;
  level: string;
  raised_at: string;
  notified_role: string;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  incident_ref?: string | null;
  created_at: string;
  updated_at?: string | null;
}
