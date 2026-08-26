// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:badca32b76e1022606203a012cf996ec5b175c2226d13b99d80123cb84352167
export interface CreateRaitPartyDto {
  case_id: string;
  role: string;
  legitimacy_basis?: string | null;
  person_name: string;
  document_number: string;
  contact_email?: string | null;
  representation_kind?: string | null;
  representation_verified?: boolean;
  representation_document_id?: string | null;
}
