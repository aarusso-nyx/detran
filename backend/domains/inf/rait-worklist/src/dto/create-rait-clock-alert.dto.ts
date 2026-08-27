// Generated from BP-INF-RAIT-WORKLIST-001 v1.0.0 sha256:2297f42351909b6ac68f4a18e7c8b535508fa219dfdaa0f9b087f1ca3b745234
export interface CreateRaitClockAlertDto {
  clock_id: string;
  level: string;
  raised_at?: string;
  notified_role: string;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  incident_ref?: string | null;
}
