// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:a4378f112c84361ebe923b17329c2848218c3f266f9811c1b18090d9c79f0ee1
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
