// Generated from BP-INF-COLLECTION-001 v1.0.1 sha256:eb2537783873c7670d66ebe362abad2fe79a9d8e834a0fd30145389f995741d6
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
