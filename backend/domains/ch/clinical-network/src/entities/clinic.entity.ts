// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:17207db7ca179e913375c7645edcf4c43c3e309891634856e04a72dd4a4d8f54
export interface Clinic {
  id: string;
  tenant_id: string;
  code: string;
  cnpj: string;
  name: string;
  legal_name?: string | null;
  municipality_code?: string | null;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}
