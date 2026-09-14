// Generated from BP-INF-RAIT-WORKLIST-001 v1.1.0 sha256:972161ec1957bb785b269fd1714f3431aae529393cf58c5a2ef7fa2984a65f8f
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
