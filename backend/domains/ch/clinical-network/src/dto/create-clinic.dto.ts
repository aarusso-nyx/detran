// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:6257f652f4d63bb50c213e96f5977765a32de34bf9f211bea0c1d69d6f2a54db
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
