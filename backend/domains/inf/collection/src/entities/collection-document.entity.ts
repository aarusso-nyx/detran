// Generated from BP-INF-COLLECTION-001 v1.0.2 sha256:10fb057463797bde8609b1b2a33435d80259cd90c69c2e991c5f42e355f924cd
export interface CollectionDocument {
  id: string;
  tenant_id: string;
  infraction_id: string;
  tier: string;
  amount: number;
  barcode?: string | null;
  pix_reference?: string | null;
  valid_until: string;
  issued_for_state: string;
  status: string;
  issued_at: string;
  issued_by?: string | null;
  document_id?: string | null;
  supersedes_document_id?: string | null;
  invalidated_at?: string | null;
  created_at: string;
  updated_at?: string | null;
}
