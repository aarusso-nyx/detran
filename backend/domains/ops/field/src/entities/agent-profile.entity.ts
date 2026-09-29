// Generated from BP-OPS-FIELD-001 v1.2.0 sha256:0cecb280a562a6d26c2ea7af68a781de3cfa2ce054d9cae2cc6c1a6c06cc1082
export interface AgentProfile {
  id: string;
  tenant_id: string;
  traffic_agency_id: string;
  user_ref: string;
  operational_unit_id?: string | null;
  registration_number: string;
  credential_number?: string | null;
  functional_status: string;
  credential_valid_until?: string | null;
  trained_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
