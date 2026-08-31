// Generated from BP-CH-REPORTS-001 v1.2.0 sha256:5045696b00b62bf7bd1c4ae7976e61f61de9954c392aed7987edaa45ba169501
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
