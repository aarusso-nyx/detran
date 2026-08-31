// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:98288e4c3b1f3ff28eef48c4d363085a60a99484a1feac9cb173c792d0ac6a3e
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
