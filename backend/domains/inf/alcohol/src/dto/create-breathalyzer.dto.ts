// Generated from BP-INF-ALCOHOL-001 v1.2.0 sha256:f54fa6e2f04e73d65b7b187ded6fe373d6b14c80f840688310d1f09b9420e20f
export interface CreateBreathalyzerDto {
  traffic_agency_id: string;
  serial_number: string;
  model?: string | null;
  manufacturer?: string | null;
  last_calibration_at?: string | null;
  calibration_valid_until?: string | null;
  status?: string;
}
