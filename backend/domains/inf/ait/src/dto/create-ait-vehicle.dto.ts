// Generated from BP-INF-AIT-001 v1.2.0 sha256:bbea1ddf9778bda02679f21a82457ea86830dad4f230eb271a51f14f05d22f6d
export interface CreateAitVehicleDto {
  ait_id: string;
  vehicle_snapshot_id: string;
  role: string;
  visually_confirmed_by_agent?: boolean;
  observed_divergence?: string | null;
}
