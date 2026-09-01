// Generated from BP-CH-CLINICAL-NETWORK-001 v1.1.0 sha256:82e75f24c423a323e597e8da9f59db8f0ac0c54ce3edd34ae7e02895d71a176e
export interface CreateProfessionalDto {
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
  is_active?: boolean;
}
