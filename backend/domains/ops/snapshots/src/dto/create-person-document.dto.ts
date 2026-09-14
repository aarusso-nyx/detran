// Generated from BP-OPS-SNAPSHOTS-001 v1.0.0 sha256:bebc10f45ae4f8887acc821ee7211894780dd9bd4b5a67d1edfbd371f54a21c4
export interface CreatePersonDocumentDto {
  person_id: string;
  document_type: string;
  document_number: string;
  issuing_uf?: string | null;
  valid_until?: string | null;
  license_category?: string | null;
  status?: string | null;
  source: string;
}
