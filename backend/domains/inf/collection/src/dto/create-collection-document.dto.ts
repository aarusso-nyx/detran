// Generated from BP-INF-COLLECTION-001 v1.0.0 sha256:9553391da82dfaf5acf236128822deb730f18b660ab5416e12bdbb0014ca1c7f
export interface CreateCollectionDocumentDto {
  infraction_id: string;
  tier: string;
  amount: number;
  barcode?: string | null;
  pix_reference?: string | null;
  valid_until: string;
  issued_for_state: string;
  status?: string;
  issued_at?: string;
  issued_by?: string | null;
  document_id?: string | null;
  supersedes_document_id?: string | null;
  invalidated_at?: string | null;
}
