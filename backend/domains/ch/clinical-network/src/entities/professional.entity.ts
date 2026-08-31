// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:9e9bbc2f438a9fcb8207678f2c0927e3013d7ec0f104563fbebaf3ac446c8f7a
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
  email?: string | null;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
