// Generated from BP-INF-AIT-001 v1.2.0 sha256:7501ee3ae148ed392c384119fcce2158f0accb353d0ce4c4406b3863321a28ea
export interface CreateAitVehicleDto {
  ait_id: string;
  vehicle_snapshot_id: string;
  role: string;
  visually_confirmed_by_agent?: boolean;
  observed_divergence?: string | null;
}
