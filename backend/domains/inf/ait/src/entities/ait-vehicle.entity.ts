// Generated from BP-INF-AIT-001 v1.1.0 sha256:de3a429b81e860fb45d3abba728570d01cdfd3b886f55ff770273d4d6fff365f
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
