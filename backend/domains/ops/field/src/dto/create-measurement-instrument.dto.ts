// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
export interface CreateMeasurementInstrumentDto {
  traffic_agency_id: string;
  instrument_type: string;
  serial_number: string;
  brand: string;
  model: string;
  inmetro_model_approval: string;
  verification_certificate_number?: string | null;
  initial_verification_at?: string | null;
  last_verification_at?: string | null;
  verification_valid_until?: string | null;
  status?: string;
}
