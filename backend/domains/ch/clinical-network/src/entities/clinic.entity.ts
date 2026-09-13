// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.1 sha256:cf3ec339cc0ca843606bd21a0fdf72f4b789898c5953117bfb9bf4fef54c191d
export interface Clinic {
  id: string;
  tenant_id: string;
  code: string;
  cnpj: string;
  name: string;
  legal_name?: string | null;
  municipality_code?: string | null;
  region_code: string;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
