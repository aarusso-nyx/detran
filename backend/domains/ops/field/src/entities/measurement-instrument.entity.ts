// Generated from BP-OPS-FIELD-001 v1.1.0 sha256:5a59c7ce8135a9525483148958cce1459ea0402e62977f6e952298cd8d4b281e
export interface MeasurementInstrument {
  id: string;
  tenant_id: string;
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
  status: string;
  created_at: string;
  updated_at?: string | null;
}
