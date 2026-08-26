// Generated from BP-INF-SPEED-001 v1.0.0 sha256:621c9dd37f71bc7fbb14a32b3df72d186e5f6f5d513de297d5559c3ac37ae44e
export interface CreateSpeedMeterDto {
  model: string;
  serial_number: string;
  agency_identifier: string;
  meter_type?: string;
  inmetro_model_approval: string;
  has_ocr?: boolean;
  active?: boolean;
}
