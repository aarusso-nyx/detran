// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1 sha256:cf3ec339cc0ca843606bd21a0fdf72f4b789898c5953117bfb9bf4fef54c191d
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
