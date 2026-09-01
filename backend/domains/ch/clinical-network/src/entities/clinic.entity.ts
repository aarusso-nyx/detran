// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
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
