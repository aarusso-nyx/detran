// Generated from BP-INF-ALCOHOL-001 v1.1.0 sha256:18decd0fa5855e93f40ce052c3ffb2ec4ad022530cd5da983fadf681a45bd246
export interface CreateBreathalyzerDto {
  traffic_agency_id: string;
  serial_number: string;
  model?: string | null;
  manufacturer?: string | null;
  last_calibration_at?: string | null;
  calibration_valid_until?: string | null;
  status?: string;
}
