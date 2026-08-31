// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db
export interface Professional {
  id: string;
  tenant_id: string;
  clinic_id: string;
  user_id?: string | null;
  person_name: string;
  document_cpf?: string | null;
  professional_kind: string;
  council_type?: string | null;
  council_number?: string | null;
  council_state?: string | null;
  email?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
