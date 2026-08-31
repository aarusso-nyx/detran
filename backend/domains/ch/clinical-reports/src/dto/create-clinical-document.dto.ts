// Generated from BP-CH-REPORTS-001 v1.1.0 sha256:beee4caafe2a85a62db62a7c64f47b7e234388f5606028dbc331786eb1e2f350
export interface CreateClinicalDocumentDto {
  encounter_id?: string | null;
  patient_id: string;
  kind: string;
  storage_document_id: string;
  content_type: string;
  sha256: string;
  size_bytes: number;
  uploaded_by: string;
}
