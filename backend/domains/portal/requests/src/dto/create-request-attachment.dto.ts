// Generated from BP-PORTAL-REQUESTS-001 v1.0.2 sha256:1861cc41e71895a553a106b4be9f7f02958d1829af65885904d1c8f6a9aeb07c
export interface CreateRequestAttachmentDto {
  request_id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  sha256: string;
  upload_state?: string;
  storage_ref?: string | null;
}
