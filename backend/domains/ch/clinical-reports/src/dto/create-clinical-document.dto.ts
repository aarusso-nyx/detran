// Generated from BP-CH-REPORTS-001 v1.0.0 sha256:959226a383e0fb64d104a887fe34cb5dba462d875869163a39abc94227f6f966
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
