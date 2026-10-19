// Generated from BP-INF-RAIT-WORKLIST-001 v1.5.1 sha256:d64b808c363287ff59a68d90dcc41991994d835a49117d5a16e61314f2edd48b
export interface CreateRaitClockAlertDto {
  clock_id: string;
  level: string;
  raised_at?: string;
  notified_role: string;
  acknowledged_at?: string | null;
  acknowledged_by?: string | null;
  incident_ref?: string | null;
}
