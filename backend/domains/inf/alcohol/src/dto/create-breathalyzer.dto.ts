// Generated from BP-INF-ALCOHOL-001 v1.0.0 sha256:72c248e25fda146066eccac64123aca6ffeb1112b114ed4f1f03237d033e93ec
export interface CreateBreathalyzerDto {
  traffic_agency_id: string;
  serial_number: string;
  model?: string | null;
  manufacturer?: string | null;
  last_calibration_at?: string | null;
  calibration_valid_until?: string | null;
  status?: string;
}
