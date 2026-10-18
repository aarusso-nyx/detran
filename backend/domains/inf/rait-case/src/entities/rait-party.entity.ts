// Generated from BP-INF-RAIT-CASE-001 v1.1.8 sha256:c3426aeaab9b8399bba4a449964cd2a599291a377418469f82d2cf903840098d
export interface RaitParty {
  id: string;
  tenant_id: string;
  case_id: string;
  role: string;
  legitimacy_basis?: string | null;
  person_name: string;
  document_number: string;
  contact_email?: string | null;
  representation_kind?: string | null;
  representation_verified: boolean;
  representation_document_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}
