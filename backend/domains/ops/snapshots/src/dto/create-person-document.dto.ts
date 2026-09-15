// Generated from BP-OPS-SNAPSHOTS-001 v1.1.0 sha256:c995962d248172eeb08cd92993fc4cafac0eada70cdbf240c54a4c69ce94edc4
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
