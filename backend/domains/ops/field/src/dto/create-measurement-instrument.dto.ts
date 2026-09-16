// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:1d733dedb438b939c5b6cbebda82dc6accf415c792fb8da4e82bab6e90a36220
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
