// Generated from BP-INF-RAIT-CASE-001 v1.0.0 sha256:aa7b398ec04e8ec20dddff316e606e4dc5b3dcad6348495f967681cbaf63f107
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
