// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:72e0af13a687dd9bcaa3931941707644a2214b4ece8daa63d55712fee4ad0243
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
