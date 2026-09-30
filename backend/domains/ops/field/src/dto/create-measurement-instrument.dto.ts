// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:9a2e982eefaba2059cf30be7def3e7f3da9a6c5c6b89957df63f173a8d30afee
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
