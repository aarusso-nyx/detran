// Generated from BP-INF-RAIT-CASE-001 v1.1.7 sha256:682b384b42c731e2e1120383e4c3bca4fabaa1afe2ac1360ca258758b6814154
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
