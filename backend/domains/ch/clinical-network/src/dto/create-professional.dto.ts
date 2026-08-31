// Generated from BP-CH-CLINICAL-NETWORK-001 v1.0.0 sha256:17207db7ca179e913375c7645edcf4c43c3e309891634856e04a72dd4a4d8f54
export interface CreateProfessionalDto {
  clinic_id: string;
  user_id?: string | null;
  person_name: string;
  document_cpf?: string | null;
  professional_kind: string;
  council_type?: string | null;
  council_number?: string | null;
  email?: string | null;
  phone?: string | null;
  is_active?: boolean;
}
