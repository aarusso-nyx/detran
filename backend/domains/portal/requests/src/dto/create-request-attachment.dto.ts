// Generated from BP-PORTAL-REQUESTS-001 v1.0.1 sha256:7d0a55a7a82e70ee07788622c4eec34061cd514ce99ee2f768622565ca290904
export interface CreateRequestAttachmentDto {
  request_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  upload_state?: string;
  storage_ref?: string | null;
}
