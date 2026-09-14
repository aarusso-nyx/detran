// Generated from BP-OPS-FIELD-001 v1.0.0 sha256:b5a54db524ac2a7fb0bb450442e2aef89132ee0ff1592f87be4837294e197177
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
