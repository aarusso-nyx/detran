// Generated from BP-INF-RAIT-CASE-001 v1.1.0 sha256:f85c2f343d3739d77786d05e0f2f98d07e00de6ca63aa3aaa743b5b949714f62
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
