// Generated from BP-PORTAL-IDENTITY-001 v1.0.2 sha256:bbfa6f4431768ff2ab5f9af097062b47775c79afb1a954ff7fb21b2c7743e4ea
export interface Representation {
  id: string;
  tenant_id: string;
  representative_subject_id: string;
  represented_cpf_hash: string;
  represented_name: string;
  instrument_document_id: string;
  scope: string;
  valid_until?: string | null;
  state: string;
  refusal_reason?: string | null;
  created_at: string;
  updated_at?: string | null;
}
