// Generated from BP-INF-SPEED-001 v1.1.0 sha256:a7576a43ce5eca2a2e93dd79ac603a578aa6e7b0127a6dc276c749cd38b02411
export interface CreateSpeedMeterDto {
  model: string;
  serial_number: string;
  agency_identifier: string;
  meter_type?: string;
  inmetro_model_approval: string;
  has_ocr?: boolean;
  active?: boolean;
}
