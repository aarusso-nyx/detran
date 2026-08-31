// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:243dd2a69921d6544f3664d22ea24b32a34148a32d18659ca5d926815bfbe154
export interface CreateClinicDto {
  code: string;
  cnpj: string;
  name: string;
  legal_name?: string | null;
  municipality_code?: string | null;
  region_code: string;
  address?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active?: boolean;
}
