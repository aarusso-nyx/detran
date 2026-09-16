// Generated from BP-INF-AIT-001 v1.2.0 sha256:a92e771e8f034647144a60080673e25e807fdbc93a27c59a1da0fc32710fd2ea
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
