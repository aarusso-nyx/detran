// Generated from BP-INF-AIT-001 v1.2.0 sha256:929e2e65586fc826e76dc66fceae7a52e7920abed66169e1291a67e2bd055f6d
export interface AitVehicle {
  id: string;
  tenant_id: string;
  ait_id: string;
  vehicle_snapshot_id: string;
  role: string;
  visually_confirmed_by_agent: boolean;
  observed_divergence?: string | null;
  created_at: string;
  updated_at?: string | null;
}
